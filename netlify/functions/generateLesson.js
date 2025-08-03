// Adaptação para Netlify Functions
require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

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

exports.handler = async (event, context) => {
  console.log("--- Função generateLesson (Netlify) foi chamada ---");

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: `Method ${event.httpMethod} Not Allowed` }),
      headers: { 'Allow': 'POST' }
    };
  }

  let text;
  try {
    const body = JSON.parse(event.body);
    text = body.text;
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Corpo da requisição inválido ou não é JSON.' })
    };
  }


  if (!text) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'O corpo da requisição deve conter a propriedade "text".' })
    };
  }

  console.log(`Gerando lição para o texto: "${text}"`);

  try {
    const prompt = MASTER_PROMPT.replace('{frase_hebraica}', text);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = await response.text();

    console.log('--- RESPOSTA BRUTA DA API ---');
    console.log(responseText);
    console.log('--- FIM DA RESPOSTA ---');

    if (responseText.startsWith("```json")) {
      responseText = responseText.substring(7, responseText.length - 3).trim();
    }

    let lessonJson;
    try {
      lessonJson = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Erro ao fazer o parse do JSON:", parseError);
      console.error("Texto que falhou no parse:", responseText);
      throw new Error("A resposta da API não é um JSON válido.");
    }

    console.log("JSON parseado com sucesso. Retornando para o cliente.");
    
    return {
      statusCode: 200,
      body: JSON.stringify(lessonJson)
    };

  } catch (error) {
    console.error("Erro ao chamar a API Gemini ou ao processar a resposta:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Falha ao gerar a lição.', details: error.message })
    };
  }
};