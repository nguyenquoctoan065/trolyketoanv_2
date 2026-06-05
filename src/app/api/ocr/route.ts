import { GoogleGenAI, Type } from '@google/genai';

export const maxDuration = 60;

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

    const mimeType = file.type;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

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
      return Response.json(JSON.parse(outputText));
    } else {
      return Response.json({ error: "Không thể trích xuất dữ liệu từ ảnh." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Next.js OCR API Error:", error);
    let errorMessage = "Lỗi hệ thống khi OCR.";
    if (error && (error.status === 429 || (error.message && (error.message.includes("429") || error.message.includes("Quota"))))) {
      errorMessage = "Hệ thống Google báo lỗi: Đã vượt quá giới hạn lượt dùng API Gemini miễn phí (Quota exceeded - 429). Do tài khoản Google của bạn đã hết hạn mức, vui lòng đổi API Key khác hoặc nâng cấp gói API.";
    } else if (error && error.message) {
      try {
        const parsed = JSON.parse(error.message);
        errorMessage = parsed.error?.message || error.message;
      } catch (e) {
        errorMessage = error.message;
      }
    }
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
