# 📊 Feature: Geração de Relatórios de Produtividade

## 📌 Contexto e Objetivo
Atualmente, o usuário consegue gerenciar suas Tarefas e Metas individualmente, e o Dashboard fornece um resumo rápido da semana. No entanto, para um melhor acompanhamento de produtividade a longo prazo, precisamos de uma funcionalidade dedicada de **Relatórios**. 

O objetivo desta feature é criar uma nova página de relatórios que exiba estatísticas e gráficos sobre o desempenho do usuário, consolidando os dados de conclusão de tarefas e o avanço das metas.

## 🔎 Análise do Estado Atual
O banco de dados já possui os dados necessários para essas métricas:
- **Tabela `tasks`**: Possui o status de conclusão (`completed`), a data agendada (`due_date`) e está vinculada ao usuário.
- **Tabela `metas`**: Possui o `status` (cumprida, parcialmente, não cumprida), `categoria`, e `periodo`.

## 🛠️ Como o relatório será implementado

### 1️⃣ Backend (Rails)
Será necessário criar um novo endpoint agregado que retorne as estatísticas prontas para o frontend, evitando processamento desnecessário no cliente.
- **Endpoint sugerido:** `GET /reports` (dentro de um `ReportsController`).
- **Dados a serem retornados (JSON):**
  - **Tarefas:** Total de tarefas, tarefas concluídas, taxa de conclusão (%), tarefas concluídas agrupadas por dia/mês.
  - **Metas:** Total de metas, distribuição por `status` (quantas estão cumpridas, parcialmente, etc.), metas agrupadas por `categoria`.

### 2️⃣ Frontend (Next.js)
Uma nova aba no sistema dedicada para a visualização gráfica desses dados.
- **Nova Rota:** Criar a página `/relatorios` acessível via `Sidebar`.
- **Nova Dependência:** Instalar uma biblioteca de gráficos para React (recomendação: **[Recharts](https://recharts.org/)** ou **Chart.js**) para desenhar gráficos de pizza e barras simples e elegantes, seguindo a paleta de cores atual (Clear Theme).
- **Interface:**
  - Gráfico circular de conclusão de Metas vs Status.
  - Gráfico de barras de Tarefas concluídas nos últimos 7 dias.
  - (Opcional/Bônus) Botão "Exportar Relatório": Usar biblioteca no frontend (ex: `jspdf` ou window.print estilizado) para permitir que o usuário baixe o relatório em PDF.

## ✅ Tarefas (Checklist)

**Backend:**
- [ ] Criar rotas e `ReportsController`.
- [ ] Implementar lógicas de agregação no Model/Controller considerando apenas os registros do `current_user`.
- [ ] Escrever testes para o `ReportsController`.

**Frontend:**
- [ ] Adicionar botão "Relatórios" na Sidebar.
- [ ] Instalar biblioteca de gráficos (`npm install recharts`).
- [ ] Criar página `/relatorios` fazendo requisição para `GET /reports` via `useApi`.
- [ ] Montar os componentes gráficos (`ChartTarefas`, `ChartMetas`).
- [ ] (Opcional) Adicionar funcionalidade de exportar/imprimir relatório.

## 📝 Notas de Implementação
- O processamento pesado de agrupamento (`GROUP BY`, `COUNT`) deve ser feito usando queries SQL/ActiveRecord otimizadas no backend.
- Manter o visual alinhado com o redesign recente (bordas arredondadas, fundo branco/cinza claro, sem suporte a dark mode para evitar complexidade desnecessária nos gráficos neste primeiro momento).
