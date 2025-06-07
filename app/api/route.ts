import { LlamaCloudIndex } from "llamaindex";

// connect to existing index
const index = new LlamaCloudIndex({
    name: "llamacloud-index-2025-05-28",
    projectName: "Default",
    apiKey: process.env.LLAMA_CLOUD_API_KEY, // can provide API-key in the constructor or in the env
});

// configure retriever
const retriever = index.asRetriever({
    similarityTopK: 3,
    sparse_similarity_top_k: 3,
    alpha: 0.5,
    enable_reranking: true,
    rerank_top_n: 3,
});

const nodes = retriever.retrieve({
    query: "Example Query"
});