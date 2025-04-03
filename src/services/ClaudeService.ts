import Anthropic from '@anthropic-ai/sdk';

class ClaudeService {
    private anthropic: Anthropic;

    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY || ''
        });
    }

    async generateResponse(prompt: string): Promise<string> {
        try {
            const response = await this.anthropic.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1000,
                messages: [{ role: 'user', content: prompt }]
            });
            return response.content[0].type === 'text' ? response.content[0].text : 'No se pudo generar una respuesta.';
        } catch (error) {
            console.error('Error al generar respuesta:', error);
            return 'Lo siento, hubo un error al generar la respuesta.';
        }
    }

    async generateGameHint(gameState: any): Promise<string> {
        const prompt = `
            Eres un asistente de juego de memoria. El jugador está en la siguiente situación:
            - Movimientos realizados: ${gameState.moves}
            - Parejas encontradas: ${gameState.matches}
            - Tiempo transcurrido: ${gameState.timeElapsed} segundos
            
            Por favor, proporciona una pista útil en español que ayude al jugador a mejorar su estrategia,
            sin revelar directamente la ubicación de las cartas.
        `;
        return this.generateResponse(prompt);
    }

    async generateGameAnalysis(gameStats: any): Promise<string> {
        const prompt = `
            Analiza el rendimiento del jugador en el juego de memoria:
            - Total de movimientos: ${gameStats.totalMoves}
            - Parejas encontradas: ${gameStats.matchesFound}
            - Tiempo total: ${gameStats.timeElapsed} segundos
            - Tiempo promedio por movimiento: ${gameStats.averageTimePerMove.toFixed(2)} segundos
            
            Por favor, proporciona un análisis detallado en español del rendimiento del jugador,
            incluyendo áreas de mejora y consejos específicos.
        `;
        return this.generateResponse(prompt);
    }
}

export const claudeService = new ClaudeService(); 