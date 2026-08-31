class ReportsController < ApplicationController
  def index
    user = current_user
    
    # 1. Estatísticas de Tarefas
    all_tasks = user.tasks
    total_tasks = all_tasks.count
    completed_tasks = all_tasks.where(completed: true).count
    pending_tasks = total_tasks - completed_tasks
    task_completion_rate = total_tasks > 0 ? ((completed_tasks.to_f / total_tasks) * 100).round(1) : 0

    # Agrupar tarefas concluídas dos últimos 7 dias
    seven_days_ago = 6.days.ago.beginning_of_day
    completed_tasks_recent = all_tasks.where(completed: true)
                                      .where('updated_at >= ?', seven_days_ago)
                                      .group("DATE(updated_at)")
                                      .count

    # Formatar para um array que o recharts entenda bem (garantindo os 7 dias, mesmo zerados)
    tasks_by_day = (0..6).map do |i|
      date = (6 - i).days.ago.to_date
      {
        date: date.strftime("%d/%m"),
        completed: completed_tasks_recent[date] || 0
      }
    end

    # 2. Estatísticas de Metas
    all_metas = user.metas
    total_metas = all_metas.count
    
    metas_cumpridas = all_metas.where(status: 'cumprida').count
    metas_parciais = all_metas.where(status: 'parcialmente_cumprida').count
    metas_nao_cumpridas = all_metas.where(status: 'nao_cumprida').count
    
    meta_completion_rate = total_metas > 0 ? ((metas_cumpridas.to_f / total_metas) * 100).round(1) : 0

    # Retorno estruturado em JSON
    render json: {
      tasks: {
        total: total_tasks,
        completed: completed_tasks,
        pending: pending_tasks,
        completion_rate: task_completion_rate,
        history_last_7_days: tasks_by_day
      },
      metas: {
        total: total_metas,
        cumpridas: metas_cumpridas,
        parcialmente_cumpridas: metas_parciais,
        nao_cumpridas: metas_nao_cumpridas,
        completion_rate: meta_completion_rate
      }
    }, status: :ok
  end

  def custom
    user = current_user
    report_type = params[:type]
    start_date = params[:start_date].presence
    end_date = params[:end_date].presence
    status = params[:status].presence

    if report_type == 'tasks'
      tasks = user.tasks
      tasks = tasks.where('due_date >= ?', start_date) if start_date
      tasks = tasks.where('due_date <= ?', end_date) if end_date
      
      if status == 'completed' || status == 'executada'
        tasks = tasks.where(completed: true)
      elsif status == 'pending' || status == 'pendente'
        tasks = tasks.where(completed: false)
      end
      
      render json: tasks, status: :ok
    elsif report_type == 'metas'
      metas = user.metas
      metas = metas.where('created_at >= ?', start_date) if start_date
      metas = metas.where('created_at <= ?', end_date) if end_date
      
      if status && status != 'all'
        metas = metas.where(status: status)
      end
      
      render json: metas, status: :ok
    else
      render json: { error: 'Tipo de relatório inválido' }, status: :bad_request
    end
  end
end
