import express from "express";
import path from "path";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import dotenv from "dotenv";

// Load .env file for local development
dotenv.config();

// Initialize Gemini client directly using env var
// Note: We'll check for the KEY inside the request context or just assume process.env.GEMINI_API_KEY
// The platform manages process.env.GEMINI_API_KEY if the user sets it.

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // Use memory storage for uploads
  const upload = multer({ storage: multer.memoryStorage() });

  // API Routes
  app.post("/api/ocr", upload.single("file"), async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Thieu API Key cua Gemini. Vui long cau hinh trong Settings > Secrets." });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Khong tim thay file" });
      }

      const mimeType = req.file.mimetype;
      const base64Data = req.file.buffer.toString("base64");

      const ai = new GoogleGenAI({ 
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      // Define the schema for the requested fields with a confidence score for each
      const fieldSchema = (valueType: Type) => ({
        type: Type.OBJECT,
        properties: {
          value: { type: valueType },
          confidence: { type: Type.STRING, description: "high, medium, or low" }
        }
      });

      const schema = {
        type: Type.OBJECT,
        properties: {
          invoice_date: fieldSchema(Type.STRING),
          invoice_number: fieldSchema(Type.STRING),
          vendor_name: fieldSchema(Type.STRING),
          vendor_tax_code: fieldSchema(Type.STRING),
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: fieldSchema(Type.STRING),
                quantity: fieldSchema(Type.NUMBER),
                unit_price: fieldSchema(Type.NUMBER),
                amount: fieldSchema(Type.NUMBER)
              }
            }
          },
          vat_rate: fieldSchema(Type.NUMBER),
          subtotal: fieldSchema(Type.NUMBER),
          vat_amount: fieldSchema(Type.NUMBER),
          total: fieldSchema(Type.NUMBER),
          notes: fieldSchema(Type.STRING),
          needs_review: { type: Type.BOOLEAN, description: "Set to true if any key fields are missing or low confidence" }
        }
      };

      const prompt = `Bạn là một trợ lý kế toán chuyên nghiệp. Hãy đọc hóa đơn trong hình ảnh hoặc PDF này.
Nhiệm vụ của bạn là trích xuất dữ liệu và xuất ra JSON theo đúng định dạng.
Lưu ý:
- Nếu không đọc được trường nào, bỏ trống (null) value đó và đặt confidence là "low".
- Phân tích cẩn thận các mặt hàng (items).
- Cung cấp điểm confidence ("high", "medium", "low") cho mỗi trường đã trích xuất.
- Ngày nên định dạng DD/MM/YYYY nếu có thể nhận diện rõ.
- Các số tiền không nên có dấu phẩy hay ký tự tiền tệ, chỉ để số (Number).`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          prompt
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.1
        }
      });

      const outputText = response.text;
      if (outputText) {
        res.json(JSON.parse(outputText));
      } else {
        res.status(500).json({ error: "Khong the trich xuat du lieu tu anh." });
      }

    } catch (error: any) {
      console.error("OCR API Error:", error);
      let errorMessage = "Loi he thong khi OCR.";
      if (error && (error.status === 429 || (error.message && (error.message.includes("429") || error.message.includes("Quota"))))) {
        errorMessage = "Hệ thống Google báo lỗi: Đã vượt quá giới hạn lượt dùng API Gemini miễn phí (Quota exceeded - 429). Tài khoản Google của bạn đã tới giới hạn, vui lòng đổi API Key khác hoặc đợi một lúc.";
      } else if (error && error.message) {
        try {
          const parsed = JSON.parse(error.message);
          errorMessage = parsed.error?.message || error.message;
        } catch (e) {
          errorMessage = error.message;
        }
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
