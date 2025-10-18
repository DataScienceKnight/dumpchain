/**
 * Analisa (parseia) uma string FEN e retorna um objeto
 * com seus componentes. (Código do Exemplo Anterior)
 */
function parseFen(fenString) {
    // ... (Mantenha a sua função parseFen completa aqui)
    
    // Simplificando para a entrada de dados (o core da função anterior permanece)
    
    if (typeof fenString !== 'string') return null;

    const fields = fenString.trim().split(/\s+/);

    if (fields.length !== 6) return null; // Validação básica

    const [
        piecePlacement,
        activeColor,
        castlingAvailability,
        enPassantTarget,
        halfmoveClock,
        fullmoveNumber
    ] = fields;

    // Função auxiliar para converter a parte de Posição das Peças em um array 8x8
    function parsePiecePlacement(pp) {
        const ranks = pp.split('/');
        if (ranks.length !== 8) return null; 

        const board = [];
        for (const rank of ranks) {
            const rankArray = [];
            let fileCount = 0;

            for (const char of rank) {
                if (/[1-8]/.test(char)) {
                    const emptySquares = parseInt(char, 10);
                    for (let j = 0; j < emptySquares; j++) {
                        rankArray.push(null); 
                    }
                    fileCount += emptySquares;
                } else if (/[pnbrqkPNBRQK]/.test(char)) {
                    rankArray.push(char);
                    fileCount++;
                } else {
                    return null; // Caractere inesperado
                }
            }

            if (fileCount !== 8) return null; // Fileira incompleta ou excessiva
            board.push(rankArray);
        }
        return board;
    }

    const board = parsePiecePlacement(piecePlacement);
    if (!board) {
        return null;
    }

    return {
        isValid: true,
        piecePlacement: piecePlacement,
        board: board,
        activeColor: activeColor,
        castlingAvailability: castlingAvailability,
        enPassantTarget: enPassantTarget,
        halfmoveClock: parseInt(halfmoveClock, 10),
        fullmoveNumber: parseInt(fullmoveNumber, 10),
        fen: fenString
    };
}


// --- Lógica de Integração com HTML ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obter referências aos elementos do DOM
    const form = document.getElementById('fenForm');
    const input = document.getElementById('fenInput');
    const output = document.getElementById('output');

    // 2. Adicionar o Listener de evento ao formulário
    form.addEventListener('submit', handleFenSubmit);

    /**
     * Manipula o evento de envio do formulário.
     * @param {Event} event 
     */
    function handleFenSubmit(event) {
        // Intercepta o envio do formulário para prevenir o recarregamento da página
        event.preventDefault(); 

        const fenString = input.value;
        const result = parseFen(fenString);

        // Limpa classes de status anteriores
        output.classList.remove('error', 'success');

        if (result && result.isValid) {
            // FEN válido

            // Usa JSON.stringify para formatar o objeto de saída
            const outputText = JSON.stringify(result, null, 2);
            
            // Exibe o resultado e adiciona classe de sucesso
            output.innerHTML = `<pre>${outputText}</pre>`;
            output.classList.add('success');

            // Opcional: Log no console para depuração
            console.log("FEN analisado com sucesso:", result);

        } else {
            // FEN inválido
            let errorMessage = "Erro: O FEN inserido não é válido. Verifique o formato e o número de campos.";
            
            // Verifica o erro mais detalhado (opcional, requer refinamento da função parseFen)
            if (fenString.trim().split(/\s+/).length !== 6) {
                errorMessage = "Erro FEN: Esperado 6 campos separados por espaço.";
            }

            output.textContent = errorMessage;
            output.classList.add('error');
            
            console.error("Erro na análise FEN:", fenString);
        }
    }
});