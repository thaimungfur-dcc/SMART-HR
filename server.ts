import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Friendly offline backup mode to guide the user on how to configure
function getOfflineReply(message: string, alertReason?: string): string {
  const explanation = alertReason || `ขณะนี้ระบบกำลังทำงานอยู่ใน **โหมดแนะนำข้อมูลออฟไลน์ (Offline Backup Mode)** \n\n⚠️ **คำชี้แจง:** ระบบยังไม่พบการตั้งค่ากุญแจความปลอดภัยเครือข่าย \`GEMINI_API_KEY\` ในระบบรักษาความปลอดภัย`;

  let backupReply = `สวัสดีค่ะ! ฉันคือ T All BOT ผู้ช่วยอัจฉริยะของคุณ\n\n${explanation}\n\n💡 **วิธีการตั้งค่า/แก้ไขเพื่อใช้งานอย่างเต็มรูปแบบ (Google Search Grounding):**\n1. ไปที่แถบเมนูด้านบนขวา คลิกไอคอน **Settings (รูปฟันเฟือง)**\n2. เลือกหัวข้อ **Secrets** ในหน้าต่างรายการคีย์ลับ\n3. เพิ่มหรือปรับแก้อัตลักษณ์ตัวแปรชื่อ \`GEMINI_API_KEY\` และนำคีย์ API จาก Google AI Studio ที่มีเครดิตใช้งานมาวาง จากนั้นกดปุ่มบันทึกค่ะ\n4. ระบบจะปลดล็อกโหมดส่งข้อถามตอบแบบเรียลไทม์ได้ทันทีหลังป้อนกุญแจถูกต้องโดยไม่ต้องรีสตาร์ทค่ะ!\n\n---\n\n**ตัวช่วยออฟไลน์แนะนำแนวทางการตอบเบื้องต้นสำหรับคำถามของคุณ:**\n`;

  const text = message.toLowerCase();
  if (text.includes("kpi") || text.includes("kpis") || text.includes("เป้า")) {
    backupReply += `
ในการพัฒนา KPIs หรือ OKRs สำหรับกลุ่มฝ่ายจัดซื้อ (Purchasing) และแผนกปฏิบัติการ:
1. **คลังสินค้าและการจัดส่ง:** วัดผล On-Time In-Full (OTIF) % อัตราการจัดส่งตรงเวลา, Inventory Accuracy (ความแม่นยำของยอดคลัง)
2. **ฝ่ายจัดซื้อ:** เน้น Cost Savings % (การประหยัดงบจัดซื้อได้เมื่อเทียบราคาตลาด), อัตราความยืดหยุ่นและการเจรจาต่อรองกับซัพพลายเออร์, จำนวนคู่ค้าหลักที่ผ่านเกณฑ์ทดสอบในระบบ (Supplier Quality Scale)
3. **การประเมิน:** รอบความถี่ที่ปรับปรุงร่วมกันเพื่อลดช่องโหว่การสื่อสาร`;
  } else if (text.includes("warning") || text.includes("เตือน") || text.includes("ผิดวินัย") || text.includes("หนังสือเตือน")) {
    backupReply += `
สำหรับกรณีพนักงานกระทำความผิดวินัยขององค์กรตามมาตรฐานกฎหมายแรงงานไทย:
1. **กฎข้อบังคับ:** องค์กรต้องออกหนังสือเตือน (Written Warning) เป็นลายลักษณ์อักษร ชี้แจงวันที่และเหตุการณ์ความผิดให้ชัดเจน มีระยะเวลาบังคับใช้ 1 ปีนับแต่วันทำความผิด
2. **ความผิดร้ายแรง:** หากเป็นกระทำผิดร้ายแรงถึงขั้นยอมความไม่ได้ (เช่น ทำลายของบริษัทหรือลักทรัพย์) สามารถเลิกจ้างได้ทันทีโดยไม่ต้องจ่ายค่าชดเชยตามมาตรา 119 แห่งพระราชบัญญัติคุ้มครองแรงงาน`;
  } else if (text.includes("onboarding") || text.includes("ต้อนรับ") || text.includes("พนักงานใหม่") || text.includes("ทดลองงาน")) {
    backupReply += `
คู่มือ Checklist รับพนักงานใหม่ (Onboarding 7-Day Guide) สำหรับชัยศรีอุตสาหกรรมเกษตร:
- **Day 1:** เตรียมสถานีงาน บล็อกเช็คอิน แนะนำกฎระเบียบบริษัท มอบหมาย Buddy ช่วยเทรนคอยประกบ
- **Day 3:** ทบทวนขอบข่ายงาน (Job Description) ตัวชี้วัด KPIs เป้าหมายทดลองงาน 119 วัน
- **Day 7:** ร่วมตรวจรับฟีดแบคสัปดาห์แรกกับนโยบายบริษัทเพื่ออุดช่องโหว่ความอึดอัดของงาน`;
  } else if (text.includes("ลา") || text.includes("พักร้อน") || text.includes("ตามกฎหมาย") || text.includes("ป่วย") || text.includes("วันหยุด") || text.includes("leave")) {
    backupReply += `
สิทธิวันลาที่ลูกจ้างพึงได้รับตามเกณฑ์กฎหมายแรงงานไทย (คุ้มครองแรงงาน):
1. **วันลาป่วย:** ลาได้เท่าที่ป่วยจริง โดยได้รับค่าจ้างเท่ากับวันทำงานปกติแต่ไม่เกิน 30 วันทำงานต่อปี (หากลาติดต่อกันตั้งแต่ 3 วันทำงานขึ้นไป นายจ้างอาจเรียกใบรับรองประกอบ)
2. **วันลาหยุดพักผ่อนประจำปี (พักร้อน):** พนักงานทำงานสะสมครบ 1 ปีขึ้นไป มีสิทธิ์หยุดได้ไม่น้อยกว่า 6 วันทำงานต่อปีโดยได้รับค่าจ้างตามเดิม
3. **วันลากิจธุระอันจำเป็น:** เพื่อทำธุระอันจัดการด้วยตัวเองไม่ได้ มีสิทธิ์ได้รับรับค่าจ้างไม่ต่ำกว่า 3 วันทำงานต่อปีตามบทกฎหมายคุ้มครองแรงงานฉบับปรับปรุงใหม่`;
  } else {
    backupReply += `
ขอบคุณสำหรับคำถามนะคะ! เนื่องจากเรื่องที่คุณถามมีความจำเพาะเจาะจงมาก ขอแนะนำให้ตรวจสอบแก้ไขคีย์เชื่อมโยงของคุณผ่านช่อง Secrets ในเมนูกล่องตั้งค่าด้วยวิธีดังกล่าวข้างต้นค่ะ เพื่อให้ AI ดึงสัญญาณการตอบระดับพรีเมียมจากคลังความรู้ล่าสุดผ่านเครือข่ายอย่างมีชีวิตชีวาค่ะ`;
  }

  return backupReply;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON payloads
  app.use(express.json());

  // API router health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Copilot API Endpoint
  app.post("/api/copilot", async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const currentApiKey = process.env.GEMINI_API_KEY;
    if (!currentApiKey) {
      const backupReply = getOfflineReply(message);
      return res.json({
        text: backupReply,
        sources: [],
        offline: true
      });
    }

    try {
      const gemini = new GoogleGenAI({
        apiKey: currentApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Prepare history structure properly for @google/genai SDK
      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        // Only take up to last 10 messages to keep the token limit sensible
        const recentHistory = history.slice(-10);
        recentHistory.forEach((h: any) => {
          contents.push({
            role: h.role === 'ai' ? 'model' : 'user',
            parts: [{ text: h.text }]
          });
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: "You are T All BOT, an intelligent HR Copilot for Chaisri Agro Industrial (ชัยศรีอุตสาหกรรมเกษตร). Always assist politely and write in professional Thai. You help with personnel registration, on-boarding checklists, training syllabi (skill matrix), Thai labor law compliance, written warning advice, KPI formulation, labor relations, and general HR operations. Highlight how you retrieve information accurately. Always present clear answers.",
          tools: [{ googleSearch: {} }],
        }
      });

      const text = response.text || "";
      
      // Extract links/citations for Search grounding as requested
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const searchSources = chunks
        .filter((chunk: any) => chunk.web && chunk.web.uri)
        .map((chunk: any) => ({
          title: chunk.web.title || chunk.web.uri,
          uri: chunk.web.uri
        }));

      return res.json({
        text: text,
        sources: searchSources,
        offline: false
      });
    } catch (error: any) {
      console.error("Gemini Copilot Error:", error);
      
      // Inspect if error is quota exceeded or rate limit or key error
      const errStr = String(error.message || error).toLowerCase();
      let alertReason = "";
      
      if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("limit") || errStr.includes("exhausted")) {
        alertReason = `ขณะนี้ระบบโฮสต์รายงานว่า **คีย์ของคุณเกินลิมิตปริมาณโควตาการใช้งานชั่วคราว (Quota / Rate Limit Exceeded)** \n\n⚠️ **คำชี้แจง:** บัญชี Google AI Studio ที่ผูกอยู่มีปริมาณสืบค้นต่อวันเกินโควตาจำกัด (เช่น แบบ Free Tier ที่รองรับปริมาณงานระดับเริ่มต้น)`;
      } else if (errStr.includes("key") || errStr.includes("api key") || errStr.includes("invalid") || errStr.includes("unauthorized") || errStr.includes("not found")) {
        alertReason = `ขณะนี้ระบบทางวิศวกรรมรายงานว่า **คีย์กุญแจความปลอดภัยเครือข่ายไม่ถูกต้องหรือหมดอายุ (Invalid API Key)** \n\n⚠️ **คำชี้แจง:** รหัสคีย์ \`GEMINI_API_KEY\` ที่กรอกไว้อาจไม่ถูกต้อง มีอักขระขาดหาย หรือไม่พร้อมใช้งานชั่วคราว`;
      } else {
        alertReason = `ขออภัยในความไม่สะดวกค่ะ ขณะนี้สัญญาณเครือข่ายอัจฉริยะภายนอกขัดข้องบางประการชั่วคราว (${error.message || "Network Error"})`;
      }

      const backupReply = getOfflineReply(message, alertReason);

      return res.json({
        text: backupReply,
        sources: [],
        offline: true
      });
    }
  });

  // Setup Vite Dev server middleware or static host in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

startServer();
