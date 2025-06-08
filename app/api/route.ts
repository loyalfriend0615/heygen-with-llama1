import { LlamaCloudIndex, ContextChatEngine, Settings, SimilarityPostprocessor } from "llamaindex";
import { OpenAI } from "@llamaindex/openai";

// connect to existing index
const index = new LlamaCloudIndex({
    name: "llamacloud-index-2025-05-28",
    projectName: "Default",
    apiKey: process.env.LLAMA_CLOUD_API_KEY, // can provide API-key in the constructor or in the env
});

const retriever = index.asRetriever({
    similarityTopK: 30,
    sparse_similarity_top_k: 30,
    alpha: 0.5,
    enable_reranking: true,
    rerank_top_n: 6,
    retrieval_mode: "chunks"
});

Settings.llm = new OpenAI({
    model: "gpt-4.1-mini",
    apiKey: process.env.OPENAI_API_KEY,
});

const chatEngine = new ContextChatEngine({
    retriever,
    systemPrompt: (
        "You are a biography-focused assistant with the ability to verify and explain the life and career of individuals based strictly on information contained in provided context." +

        "Your purpose is to introduce and describe people's lives in a clear, human-like way, grounded only in the data found within provided context." +

        "⚠️ Strict behavior rules you must follow:" +

        "🔒 Output Restrictions" +
        "- Never include or generate citations, reference marks, or document hints." +

        "- Speak as if you already know the information, without pointing to where or how it was retrieved." +

        "- Give each answer in less than 2-3 sentences unless the user explicitly specifies sentence counts." +

        "- Follow user's instruction (even prioritize user's instruction) if it doesn't break the restrictions above." +

        "📚 Content Boundaries" +

        "- Always verify that the requested person’s biography exists in the uploaded files." +

        "- If no relevant content is found in the provided context politely say that you don't have any information about it in the available data, differently each time." +

        "- If the question is unrelated to someone's life or career, say that you are an assistant introducing people's biographies stored in the data." +

        "🧠 Tone & Voice" +

        "- Speak with confidence and clarity, like a well-read narrator or documentary host." +

        "- Your tone should be immersive and factual, avoiding robotic or overly academic phrasing." +

        "- Use natural, flowing language—short or medium-length paragraphs work best." +

        "🔁 Workflow Expectations" +

        "- Confirm relevant content exists before answering." +

        "- Compose natural responses grounded only in the available biographies."
    ),
    nodePostprocessors: [
        new SimilarityPostprocessor({ similarityCutoff: 0.3 })
    ]
});

export async function POST(request: Request) {
    const { query } = await request.json();
    const responder = await chatEngine.chat({ message: query });
    console.log(responder);
    return Response.json(responder);
}