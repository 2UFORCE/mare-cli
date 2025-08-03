// MARE Project Verifier Script

const fs = require('fs');
const path = require('path');

const logResult = (label, status, details = '') => {
  const symbol = status ? '✓' : '✗';
  const color = status ? '\x1b[32m' : '\x1b[31m'; // Verde para sucesso, Vermelho para falha
  console.log(`${color}[${symbol}] ${label}\x1b[0m ${details}`);
};

const checkFileExists = (filePath) => {
  const fullPath = path.join(__dirname, filePath);
  return fs.existsSync(fullPath);
};

console.log('--- Iniciando Verificação do Projeto MARE ---\n');

// 1. Verificação do package.json
console.log('1. Analisando o package.json:');
const packageJsonPath = path.join(__dirname, 'package.json');
if (checkFileExists('package.json')) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Checa a configuração de Módulo
    logResult('Configuração "type": "module" existe', pkg.type === 'module', '(Essencial para usar "import")');

    // Checa a dependência do react-scripts
    const reactScriptsExists = pkg.dependencies && pkg.dependencies['react-scripts'];
    logResult('Dependência "react-scripts" encontrada', !!reactScriptsExists);

    // Checa o script "start"
    const startScriptCorrect = pkg.scripts && pkg.scripts.start === 'react-scripts start';
    logResult('Script "start" está configurado corretamente', !!startScriptCorrect);

  } catch (error) {
    logResult('Leitura do package.json', false, 'Erro ao parsear o arquivo. Está corrompido?');
  }
} else {
  logResult('Arquivo package.json', false, 'NÃO ENCONTRADO NA RAIZ DO PROJETO.');
}

console.log('\n2. Verificando a Estrutura de Arquivos Essenciais:');
// 2. Verificação da existência dos arquivos essenciais
const requiredFiles = [
  'public/index.html',
  'src/index.js',
  'src/App.js',
  'src/LessonView.js',
  'src/RootConnectorExercise.js',
  'src/licoes.json'
];

requiredFiles.forEach(file => {
  logResult(`Arquivo "${file}" existe`, checkFileExists(file));
});

console.log('\n--- Verificação Concluída ---');
console.log('Copie toda esta saída e envie para o Gemini para análise.');