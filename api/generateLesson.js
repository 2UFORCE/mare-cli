// src/api/generateLesson.js

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializa o Google AI SDK com a chave de API a partir das variáveis de ambiente
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MASTER_PROMPT = `
Você é um especialista em linguística hebraica e um pedagogo. Sua tarefa é analisar uma frase em hebraico e gerar uma lição estruturada em formato JSON.
A frase para análise é: "{frase_hebraica}"
Analise a frase e retorne um único objeto JSON, sem nenhum texto ou formatação adicional. O objeto JSON deve ter a seguinte estrutura:
{
  "id": 1,
  "frase_chave": "A frase em hebraico com sua tradução entre parênteses",
  "palavras": [
    {
      "palavra_hebraica": "A palavra em hebraico, com niqud (vogais)",
      "transliteracao": "A transliteração fonética da palavra",
      "traducao": "A tradução da palavra para o português",
      "raiz_shoresh": "A raiz de 3 letras (shoresh) da palavra, se aplicável. Caso contrário, null.",
      "binyan": "O binyan (ex: Pa'al, Pi'el, Hif'il) da palavra, se for um verbo. Caso contrário, null.",
      "notas_gramaticais": "Uma breve análise gramatical (ex: 'Verbo, presente, masculino singular', 'Substantivo feminino', 'Pronome pessoal')"
    }
  ],
  "perguntas": [
    {
      "pergunta": "Uma pergunta de múltipla escolha sobre o significado ou contexto da frase-chave.",
      "opcoes": [
        "Opção A",
        "Opção B (a resposta correta)",
        "Opção C",
        "Opção D"
      ],
      "resposta_correta": "O texto exato da Opção B"
    }
  ]
}
Analise cada palavra da frase fornecida e preencha o array "palavras".
Crie uma pergunta de compreensão relevante para o array "perguntas".
Certifique-se de que o JSON seja válido e siga estritamente a estrutura definida.
`;

module.exports = async (req, res) => {
  console.log("--- Função generateLesson foi chamada ---");

  // Vercel Serverless Functions rodam em um ambiente somente leitura,
  // então não podemos esperar que o .env seja carregado da mesma forma.
  // As variáveis de ambiente devem ser configuradas no painel da Vercel.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'O corpo da requisição deve conter a propriedade "text".' });
  }

  console.log(`Gerando lição para o texto: "${text}"`);

  try {
    const prompt = MASTER_PROMPT.replace('{frase_hebraica}', text);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = await response.text();

    console.log('--- RESPOSTA BRUTA DA API ---');
    console.log(responseText);
    console.log('--- FIM DA RESPOSTA ---');

    // Limpa a resposta para garantir que seja um JSON válido
    if (responseText.startsWith("```json")) {
      responseText = responseText.substring(7, responseText.length - 3).trim();
    }

    let lessonJson;
    try {
      lessonJson = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Erro ao fazer o parse do JSON:", parseError);
      console.error("Texto que falhou no parse:", responseText);
      // Joga um novo erro para ser pego pelo catch principal
      throw new Error("A resposta da API não é um JSON válido.");
    }

    console.log("JSON parseado com sucesso. Retornando para o cliente.");
    
    // Retorna a resposta JSON para o cliente
    return res.status(200).json(lessonJson);

  } catch (error) {
    console.error("Erro ao chamar a API Gemini ou ao processar a resposta:", error);
    return res.status(500).json({ error: 'Falha ao gerar a lição.', details: error.message });
  }
};
