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
        "You are a helpful assistant that ONLY answers based on the provided context. " +
        "If the context does not contain relevant information to answer the question, " +
        "Say politely that you cannot answer the question based on the available data in different ways each time."
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