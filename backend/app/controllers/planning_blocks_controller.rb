class PlanningBlocksController < ApplicationController
  before_action :set_planning_block, only: %i[show update destroy]

  # Lista os blocos de planejamento do usuário para uma data específica.
  # Uso: GET /planning_blocks?date=2026-08-31
  def index
    date = params[:date].presence || Date.current.to_s
    @planning_blocks = current_user.planning_blocks
                                    .where(date: date)
                                    .order(:start_time)

    render json: @planning_blocks
  end

  def show
    render json: @planning_block
  end

  def create
    @planning_block = current_user.planning_blocks.build(planning_block_params)

    if @planning_block.save
      render json: @planning_block, status: :created
    else
      render json: { errors: @planning_block.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @planning_block.update(planning_block_params)
      render json: @planning_block
    else
      render json: { errors: @planning_block.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @planning_block.destroy!
    head :no_content
  end

  private

  def set_planning_block
    @planning_block = current_user.planning_blocks.find(params.expect(:id))
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Bloco de planejamento não encontrado." }, status: :not_found
  end

  def planning_block_params
    params.expect(planning_block: [
      :date,
      :start_time,
      :end_time,
      :title,
      :task_id
    ])
  end
end