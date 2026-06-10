import { GoogleGenAI, Type } from '@google/genai';
import { v2 as cloudinary } from 'cloudinary';

export const maxDuration = 60;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Thiếu API Key của Gemini. Vui lòng cấu hình GEMINI_API_KEY." }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return Response.json({ error: "Không tìm thấy file tải lên" }, { status: 400 });
    }

    let mimeType = file.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') mimeType = 'application/pdf';
      else if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'heic') mimeType = 'image/heic';
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    // 1. Upload file to Cloudinary
    let cloudinaryUrl = "";
    try {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'accobot_invoices',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      cloudinaryUrl = uploadResult?.secure_url || "";
    } catch (uploadError: any) {
      console.error("Cloudinary Upload Error:", uploadError);
      return Response.json({ 
        error: `Lỗi tải hóa đơn lên Cloudinary: ${uploadError.message || uploadError}. Vui lòng kiểm tra lại cấu hình tài khoản Cloudinary trong file .env.` 
      }, { status: 500 });
    }

    if (!cloudinaryUrl) {
      return Response.json({ error: "Tải ảnh lên Cloudinary không thành công." }, { status: 500 });
    }

    // 2. Run Gemini 2.5 Flash OCR
    const ai = new GoogleGenAI({ 
      apiKey: apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build-vercel' } }
    });

    const fieldSchema = (valueType: any) => ({
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
      const parsedData = JSON.parse(outputText);
      // Attach the Cloudinary image URL so the client can save it to database
      parsedData.original_file_url = cloudinaryUrl;
      return Response.json(parsedData);
    } else {
      return Response.json({ error: "Không thể trích xuất dữ liệu từ ảnh." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Next.js OCR API Error:", error);
    let errorMessage = "Đã xảy ra sự cố hệ thống khi đọc hóa đơn. Vui lòng thử lại!";
    if (error && error.message) {
      const msg = error.message.toLowerCase();
      if (error.status === 429 || msg.includes("429") || msg.includes("quota") || msg.includes("limit")) {
        errorMessage = "Giới hạn lượt dùng thử miễn phí của API Gemini đã hết (Lỗi 429 - Quota Exceeded). Bạn vui lòng thay đổi API Key khác hoặc nâng cấp gói sử dụng nhé!";
      } else if (msg.includes("api key not valid") || msg.includes("invalid api key") || msg.includes("key invalid") || msg.includes("api_key_invalid") || msg.includes("api key invalid")) {
        errorMessage = "Khóa API Gemini (GEMINI_API_KEY) cấu hình trong file .env không hợp lệ hoặc đã bị khóa. Vui lòng kiểm tra và cập nhật lại!";
      } else if (error.status === 503 || msg.includes("503") || msg.includes("unavailable") || msg.includes("high demand") || msg.includes("overloaded")) {
        errorMessage = "Hệ thống AI hiện đang quá tải (Lỗi 503 - Máy chủ bận). Vui lòng đợi một lát và thử lại sau nhé!";
      } else {
        try {
          let jsonStr = error.message;
          if (jsonStr.includes('Error [ApiError]:')) {
            jsonStr = jsonStr.replace('Error [ApiError]:', '').trim();
          } else if (jsonStr.startsWith('[ApiError]:')) {
            jsonStr = jsonStr.replace('[ApiError]:', '').trim();
          }
          const parsed = JSON.parse(jsonStr);
          errorMessage = parsed.error?.message || error.message;
        } catch (e) {
          errorMessage = error.message;
        }
      }
    }
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
