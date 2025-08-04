// Adaptação para Netlify Functions
require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MASTER_PROMPT = `
Você é um especialista em linguística hebraica e um pedagogo. Sua tarefa é analisar uma frase em hebraico e gerar uma lição estruturada em formato JSON.
A frase para análise é: "{frase_hebraica}"

**Instruções Gerais:**
1.  **Análise de Raízes (Shorashim):** Identifique TODAS as raízes verbais e nominais possíveis. Se o texto permitir, retorne pelo menos duas raízes distintas para enriquecer o exercício. Se o texto for muito curto, retorne apenas as que encontrar. Para palavras onde uma raiz não é claramente aplicável (ex: preposições, nomes próprios), o campo "raiz_shoresh" deve ser `null`.
2.  **Estrutura do JSON:** A resposta DEVE ser um único objeto JSON, sem nenhum texto ou formatação adicional.
3.  **Tradução Separada:** O campo "frase_chave" deve conter APENAS o texto em hebraico. A tradução correspondente em português DEVE ser colocada no campo "frase_chave_traducao".
4.  **Perguntas de Compreensão:** Gere EXATAMENTE duas perguntas de múltipla escolha distintas:
    *   A primeira pergunta deve ser sobre o significado geral ou o contexto da frase.
    *   A segunda pergunta deve focar em um detalhe específico, como o significado de uma palavra-chave ou um aspecto gramatical.

**Estrutura do Objeto JSON:**
{
  "id": 1,
  "frase_chave": "O texto original em hebraico, com niqud (vogais).",
  "frase_chave_traducao": "A tradução da frase para o português.",
  "palavras": [
    {
      "palavra_hebraica": "A palavra em hebraico, com niqud",
      "transliteracao": "A transliteração fonética da palavra",
      "traducao": "A tradução da palavra para o português",
      "raiz_shoresh": "A raiz de 3 letras (shoresh) da palavra, se aplicável. Caso contrário, null.",
      "binyan": "O binyan (ex: Pa'al, Pi'el) do verbo, se aplicável. Caso contrário, null.",
      "notas_gramaticais": "Breve análise gramatical (ex: 'Verbo, presente, masc. singular')"
    }
  ],
  "perguntas": [
    {
      "pergunta": "Pergunta sobre o significado geral da frase.",
      "opcoes": ["Opção A", "Opção B (correta)", "Opção C", "Opção D"],
      "resposta_correta": "O texto exato da Opção B"
    },
    {
      "pergunta": "Pergunta focada em uma palavra ou detalhe específico.",
      "opcoes": ["Opção A", "Opção B", "Opção C (correta)", "Opção D"],
      "resposta_correta": "O texto exato da Opção C"
    }
  ]
}

Analise cada palavra da frase fornecida, preencha o array "palavras", e crie as duas perguntas conforme as instruções. Certifique-se de que o JSON seja válido.
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

    let jsonString = responseText;

    // Lógica de limpeza robusta:
    // Tenta encontrar o conteúdo entre { e } ou [ e ]
    const jsonMatch = jsonString.match(/\{[\s\S]*\}|\[[\s\S]*\]/);

    if (jsonMatch) {
      jsonString = jsonMatch[0];
    } else {
      // Se não encontrar nenhum JSON, lança um erro claro
      throw new Error("Nenhum conteúdo JSON válido encontrado na resposta da API.");
    }

    try {
      const lessonJson = JSON.parse(jsonString);
      
      console.log("JSON parseado com sucesso. Retornando para o cliente.");

      // Retorna a resposta de sucesso
      return {
        statusCode: 200,
        body: JSON.stringify(lessonJson),
      };
    } catch (error) {
      console.error("Erro ao fazer o parse do JSON extraído:", error);
      console.error("Texto que falhou no parse:", jsonString);
      throw new Error("A resposta da API parecia JSON, mas continha um erro de sintaxe.");
    }

  } catch (error) {
    console.error("Erro ao chamar a API Gemini ou ao processar a resposta:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Falha ao gerar a lição.', details: error.message })
    };
  }
};