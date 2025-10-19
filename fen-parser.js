// Mapeamento de FEN (letras) para símbolos Unicode
const pieceUnicodeMap = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
};

/**
 * Analisa (parseia) uma string FEN e retorna um objeto
 * com seus componentes e um array 8x8 do tabuleiro.
 * * @param {string} fenString A string FEN a ser analisada.
 * @returns {object|null} Objeto FEN processado ou null se inválido.
 */
function parseFen(fenString) {
    if (typeof fenString !== 'string') return null;

    const fields = fenString.trim().split(/\s+/);

    if (fields.length !== 6) return null; // Validação básica do número de campos

    const [
        piecePlacement,
        activeColor,
        castlingAvailability,
        enPassantTarget,
        halfmoveClock,
        fullmoveNumber
    ] = fields;

    /**
     * Converte o campo de posicionamento de peças em um array 8x8.
     * @param {string} pp String do posicionamento de peças (ex: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR")
     * @returns {Array<Array<string|null>>|null} Array 8x8 ou null se inválido.
     */
    function parsePiecePlacement(pp) {
        const ranks = pp.split('/');
        if (ranks.length !== 8) return null; 

        const board = [];
        for (const rank of ranks) {
            const rankArray = [];
            let fileCount = 0;

            for (const char of rank) {
                if (/[1-8]/.test(char)) { // Se for um dígito (casa(s) vazia(s))
                    const emptySquares = parseInt(char, 10);
                    // O dígito não pode ser zero, mas isso é coberto pelo regex [1-8]
                    
                    for (let j = 0; j < emptySquares; j++) {
                        rankArray.push(null); 
                    }
                    fileCount += emptySquares;
                } else if (/[pnbrqkPNBRQK]/.test(char)) { // Se for uma letra (peça)
                    rankArray.push(char);
                    fileCount++;
                } else {
                    return null; // Caractere inesperado (como '9' ou '#')
                }
            }

            if (fileCount !== 8) return null; // A fileira deve ter exatamente 8 casas
            board.push(rankArray);
        }
        return board;
    }

    const board = parsePiecePlacement(piecePlacement);
    if (!board) {
        return null; // A análise das peças falhou
    }

    // Validações básicas adicionais
    if (activeColor !== 'w' && activeColor !== 'b') return null;
    // Poderíamos adicionar mais validações aqui para os outros campos, mas vamos focar no essencial por enquanto.

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


/**
 * Gera o HTML para a visualização do tabuleiro com base no array 8x8.
 * @param {Array<Array<string|null>>} board O array 8x8 representando o tabuleiro.
 * @returns {string} O HTML gerado.
 */
function generateBoardHtml(board) {
    const squareColors = {
        light: '#f0d9b5', // Cor clara
        dark: '#b58863'   // Cor escura
    };
    
    let boardHtml = '<div class="chessboard">';

    for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
        boardHtml += '<div class="rank">'; 

        for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
            // Determina a cor da casa
            const color = (rankIndex + fileIndex) % 2 === 0 ? squareColors.light : squareColors.dark;
            
            const piece = board[rankIndex][fileIndex];
            
            // Determina a classe da peça (para cor: white/black)
            const pieceClass = piece ? 'piece ' + (piece === piece.toUpperCase() ? 'white' : 'black') : 'empty';

            // Mapeia o caractere FEN para o símbolo Unicode
            const pieceSymbol = piece ? pieceUnicodeMap[piece] : ''; 

            boardHtml += `
                <div class="square ${pieceClass}" style="background-color: ${color};">
                    ${pieceSymbol}
                </div>
            `;
        }
        boardHtml += '</div>'; // Fecha a div da fileira
    }

    boardHtml += '</div>'; // Fecha a div do tabuleiro
    return boardHtml;
}


// --- Lógica de Integração com HTML ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obter referências aos elementos do DOM
    const form = document.getElementById('fenForm');
    const input = document.getElementById('fenInput');
    const output = document.getElementById('output');
    const boardContainer = document.getElementById('board-container');

    // 2. Adicionar o Listener de evento ao formulário
    form.addEventListener('submit', handleFenSubmit);
    
    // Executa a função uma vez na carga inicial para exibir o FEN padrão
    handleFenSubmit({ preventDefault: () => {} });

    /**
     * Manipula o evento de envio do formulário.
     * @param {Event} event O evento (ou um mock para a carga inicial)
     */
    function handleFenSubmit(event) {
        // Intercepta o envio do formulário para prevenir o recarregamento da página
        if (event.preventDefault) {
             event.preventDefault(); 
        }

        const fenString = input.value;
        const result = parseFen(fenString);

        // Limpa saídas anteriores
        output.classList.remove('error', 'success');
        
        if (result && result.isValid) {
            // FEN VÁLIDO

            // 1. Gera e exibe o tabuleiro
            const boardHtml = generateBoardHtml(result.board);
            boardContainer.innerHTML = boardHtml;

            // 2. Exibe os dados do parser (JSON)
            const outputText = JSON.stringify(result, null, 2);
            output.innerHTML = `<pre>${outputText}</pre>`;
            output.classList.add('success');
            
            console.log("FEN analisado com sucesso:", result);

        } else {
            // FEN INVÁLIDO
            boardContainer.innerHTML = '<p class="error">Não foi possível gerar o tabuleiro. FEN inválido.</p>';
            
            let errorMessage = "Erro: O FEN inserido não é válido. Verifique o formato e o número de campos.";
            
            if (fenString.trim().split(/\s+/).length !== 6) {
                 errorMessage = "Erro FEN: Esperado 6 campos separados por espaço.";
            }

            output.textContent = errorMessage;
            output.classList.add('error');
            
            console.error("Erro na análise FEN:", fenString);
        }
    }
});
