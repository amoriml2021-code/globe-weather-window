# Globe Weather Window

# PROMPT – DESENVOLVIMENTO DE APLICATIVO WEB DE PREVISÃO DO TEMPO

Desenvolva um aplicativo web responsivo de **Previsão do Tempo**, com interface moderna, intuitiva e profissional, permitindo que o usuário pesquise qualquer cidade do Brasil ou do mundo e consulte as condições climáticas em tempo real.

## 1. Funcionalidades principais

- Campo de pesquisa para digitar o nome de uma cidade.
- Botão de pesquisa para consultar o clima.
- Integração com uma API gratuita, preferencialmente Open-Meteo.
- Exibição da temperatura atual em graus Celsius (°C).
- Exibição da condição climática, como:
  - Ensolarado;
  - Parcialmente nublado;
  - Nublado;
  - Chuva;
  - Tempestade;
  - Neve;
  - Neblina.
- Exibição da sensação térmica.
- Exibição da umidade relativa do ar.
- Exibição da velocidade do vento.
- Exibição da temperatura máxima e mínima do dia.
- Horário da última atualização dos dados.

## 2. Interface visual

Criar um painel visual moderno, organizado e agradável, contendo:

- Campo de pesquisa em destaque.
- Nome da cidade e país consultados.
- Temperatura em números grandes e de fácil visualização.
- Ícones representando as condições climáticas.
- Fundo dinâmico que possa mudar conforme a condição do tempo.
- Cards individuais para umidade, vento, sensação térmica e temperaturas mínima e máxima.
- Layout adaptável para computadores, tablets e celulares.

## 3. Integração com API

Utilizar preferencialmente a API gratuita Open-Meteo:

- Geocoding API para localizar a cidade pesquisada.
- Weather Forecast API para obter as informações meteorológicas.
- Não exigir chave de API quando utilizar os serviços gratuitos disponíveis.
- Converter automaticamente as coordenadas geográficas da cidade em dados meteorológicos.
- Atualizar as informações sempre que o usuário realizar uma nova pesquisa.

## 4. Experiência do usuário

- Apresentar uma mensagem amigável quando a cidade não for encontrada.
- Mostrar indicador de carregamento durante a consulta.
- Tratar erros de conexão com a API.
- Permitir realizar várias pesquisas sem atualizar a página.
- Exibir uma cidade inicial como exemplo quando o aplicativo for aberto.

## 5. Recursos adicionais

- Histórico das últimas cidades pesquisadas.
- Botão para atualizar as informações climáticas.
- Possibilidade de favoritar cidades.
- Exibição da previsão para as próximas horas.
- Exibição da previsão para os próximos 7 dias.

## 6. Requisitos técnicos

- Aplicação web funcional.
- Front-end responsivo.
- Código organizado e de fácil manutenção.
- Integração real com a API, sem utilizar dados fictícios.
- Tratamento de erros e validação dos campos.
- Boa velocidade de carregamento.
- Compatibilidade com Google Chrome, Microsoft Edge e outros navegadores modernos.

## 7. Resultado esperado

Entregar um aplicativo funcional, pronto para utilização, no qual o usuário digite o nome de uma cidade e receba imediatamente as informações meteorológicas atualizadas.

**Importante:** Não criar apenas uma demonstração visual. Todas as funcionalidades de pesquisa e consulta devem funcionar de verdade, utilizando dados reais da API meteorológica.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/00cf57c1-f20c-4487-a3fa-f726e4436d6d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
