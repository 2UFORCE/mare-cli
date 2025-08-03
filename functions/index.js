const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializa o Firebase Admin SDK
admin.initializeApp();

// Inicializa o Google AI SDK com a chave de API das configs do Firebase
// Para configurar, rode: firebase functions:config:set gemini.key="SUA_CHAVE_API"
const genAI = new GoogleGenerativeAI(functions.config().gemini.key);

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

exports.generateLesson = functions.https.onCall(async (data, context) => {
  // Pega o texto enviado pelo cliente
  const { text } = data;

  if (!text) {
    throw new functions.https.HttpsError('invalid-argument', 'A função deve ser chamada com um argumento "text".');
  }

  functions.logger.info(`Gerando lição para o texto: "${text}"`);

  try {
    // Prepara o prompt final
    const prompt = MASTER_PROMPT.replace('{frase_hebraica}', text);

    // Obtém o modelo generativo
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Faz a chamada para a API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = await response.text();

    functions.logger.info("Resposta recebida da API Gemini.");

    // Limpa a resposta para garantir que seja um JSON válido
    // A API pode retornar o JSON dentro de um bloco de código markdown
    if (responseText.startsWith("```json")) {
      responseText = responseText.substring(7, responseText.length - 3).trim();
    }

    // Parseia a string JSON para um objeto
    const lessonJson = JSON.parse(responseText);

    functions.logger.info("JSON parseado com sucesso. Retornando para o cliente.");
    return lessonJson;

  } catch (error) {
    functions.logger.error("Erro ao chamar a API Gemini ou ao processar a resposta:", error);
    throw new functions.https.HttpsError('internal', 'Falha ao gerar a lição.', error);
  }
});
