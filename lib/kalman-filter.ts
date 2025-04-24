/**
 * Implementação do Filtro de Kalman para reduzir ruído em medições de frequência cardíaca
 */
export class KalmanFilter {
  private x: number // Estado estimado
  private p: number // Estimativa de erro
  private q: number // Ruído do processo
  private r: number // Ruído da medição

  /**
   * Inicializa um novo filtro de Kalman
   * @param initialValue Valor inicial (opcional)
   * @param initialError Erro inicial (opcional)
   * @param processNoise Ruído do processo (opcional)
   * @param measurementNoise Ruído da medição (opcional)
   */
  constructor(initialValue = 0, initialError = 1, processNoise = 0.01, measurementNoise = 1) {
    this.x = initialValue
    this.p = initialError
    this.q = processNoise
    this.r = measurementNoise
  }

  /**
   * Atualiza o filtro com uma nova medição
   * @param measurement Nova medição
   * @returns Valor filtrado
   */
  update(measurement: number): number {
    // Predição
    this.p = this.p + this.q

    // Atualização
    const k = this.p / (this.p + this.r) // Ganho de Kalman
    this.x = this.x + k * (measurement - this.x)
    this.p = (1 - k) * this.p

    return this.x
  }

  /**
   * Obtém o estado atual estimado
   * @returns Estado atual
   */
  getState(): number {
    return this.x
  }

  /**
   * Redefine o filtro para um novo valor
   * @param value Novo valor
   */
  reset(value: number): void {
    this.x = value
    this.p = 1
  }
}

// Instância global do filtro para uso em toda a aplicação
const kalmanFilter = new KalmanFilter(70, 1, 0.01, 2)

/**
 * Filtra um valor de frequência cardíaca usando o filtro de Kalman
 * @param heartRate Valor de frequência cardíaca a ser filtrado
 * @returns Valor filtrado
 */
export function filterHeartRate(heartRate: number): number {
  if (typeof heartRate !== "number" || isNaN(heartRate)) {
    return 0
  }

  // Se o valor for muito diferente do estado atual, resetar o filtro
  const currentState = kalmanFilter.getState()
  if (Math.abs(heartRate - currentState) > 30 && currentState > 0) {
    kalmanFilter.reset(heartRate)
  }

  return Math.round(kalmanFilter.update(heartRate))
}

/**
 * Verifica o status da frequência cardíaca
 * @param heartRate Valor de frequência cardíaca
 * @returns Objeto com status e severidade
 */
export function checkHeartRateStatus(heartRate: number): { status: string; severity: string } {
  if (heartRate > 120) {
    return { status: "critical", severity: "critical" }
  } else if (heartRate > 100) {
    return { status: "high", severity: "warning" }
  } else if (heartRate < 50) {
    return { status: "low", severity: "warning" }
  } else {
    return { status: "normal", severity: "info" }
  }
}
