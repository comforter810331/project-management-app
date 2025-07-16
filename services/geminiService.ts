
import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        suggestedName: {
            type: Type.STRING,
            description: "一個更具體、更專業的專案名稱。",
        },
        suggestedDueDate: {
            type: Type.STRING,
            description: "一個合理的專案到期日，格式為 YYYY-MM-DD。相對於今天。",
        },
        suggestedNotes: {
            type: Type.STRING,
            description: "根據專案名稱建議的幾個初步執行步驟或備註，使用換行符號分隔。",
        },
    },
    required: ["suggestedName", "suggestedDueDate", "suggestedNotes"],
};


export interface ProjectSuggestion {
    suggestedName: string;
    suggestedDueDate: string;
    suggestedNotes: string;
}

export const generateProjectSuggestions = async (title: string): Promise<ProjectSuggestion | null> => {
    if (!process.env.API_KEY) {
        alert("Gemini API 金鑰未設定，無法使用智慧建議功能。");
        return null;
    }

    const today = new Date().toISOString().split('T')[0];
    const prompt = `您是一位專業的專案管理助理。根據使用者輸入的專案標題，為其產生一個更完整的專案名稱、一個合理的到期日，以及一些初步的執行備註。

今天的日期是：${today}
使用者輸入的標題是：「${title}」

請以 JSON 格式回傳您的建議。`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.5,
            },
        });
        
        const jsonText = response.text.trim();
        const suggestion = JSON.parse(jsonText) as ProjectSuggestion;
        return suggestion;
    } catch (error) {
        console.error("Error generating project suggestions:", error);
        alert("無法從 Gemini API 獲取建議。請檢查您的網路連線或 API 金鑰設定。");
        return null;
    }
};
