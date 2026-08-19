# 📅 Planner Virtual — Backend (Rails)

API e persistência PostgreSQL do Planner Virtual. O frontend Next.js vive em `../frontend`. O stack completo sobe na raiz com `docker compose up --build`.

Aplicação web de gerenciamento e planejamento pessoal desenvolvida em **Ruby on Rails** com banco de dados **PostgreSQL**.

---

## 🚀 Tecnologias Utilizadas

- **Linguagem:** Ruby
- **Framework Web:** Ruby on Rails
- **Banco de Dados:** PostgreSQL
- **Frontend / Views:** ERB / Hotwire (Turbo + Stimulus)
- **Controle de Versão:** Git & GitHub

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:

1. **Ruby** (versão 3.x ou superior)
   - Baixe em: [Ruby Download](https://www.ruby-lang.org/pt/downloads/) (no Windows, utilize o **RubyInstaller com Devkit**).
2. **PostgreSQL** (versão 18)
   - Baixe em: [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
   - *Durante a instalação, defina uma senha para o usuário padrão `postgres` e guarde-a.*
3. **Bundler & Rails** (gerenciador de dependências e framework)

---

## ⚙️ Instalação e Configuração

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU-USUARIO/Projeto-PLP_Planeer-virtual.git
cd Projeto-PLP_Planeer-virtual
```

### 2. Instalar Bundler e Rails (caso ainda não tenha instalado globalmente)
```bash
gem install bundler rails
```

### 3. Instalar as dependências do projeto
```bash
bundle install
```

### 4. Configurar as credenciais do banco de dados
Abra o arquivo `config/database.yml` e ajuste a senha do usuário `postgres` na seção `default`:

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  host: localhost
  port: 5432
  username: postgres
  password: SUA_SENHA_AQUI
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
```

### 5. Criar o banco e rodar as migrações
```bash
rails db:create
rails db:migrate
```

---

## 🏃 Como Executar o Projeto

Inicie o servidor de desenvolvimento:

```bash
rails server
```
*(ou simplesmente `rails s`)*

Abra o navegador e acesse:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📚 Requisitos e Diretrizes da Disciplina

- **Especificações do Projeto:** [Slide do Professor no Classroom](https://classroom.google.com/u/2/c/ODY2NzMyMTc3MTEz/m/ODY5MDI2NTI5NTA2/details)

---

## 👥 Gestão e Divisão de Tarefas

- A distribuição das funcionalidades, prazos e sprints segue o modelo ágil (Scrum).
- Acompanhamento das tarefas via quadro Scrum 