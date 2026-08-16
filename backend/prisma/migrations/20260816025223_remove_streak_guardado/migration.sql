-- A sequência e o recorde passam a ser calculados a partir das conclusões
-- (`src/services/streakServices.js`). As colunas nunca foram escritas: valiam 0 para
-- todos os hábitos, e um contador guardado divergiria do histórico assim que uma
-- conclusão antiga fosse apagada.
ALTER TABLE "Habit" DROP COLUMN "currentStreak";
ALTER TABLE "Habit" DROP COLUMN "longestStreak";
