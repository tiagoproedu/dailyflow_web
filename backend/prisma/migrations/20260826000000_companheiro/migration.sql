-- Companheiro: só o nome e a data do batismo são guardados.
-- Estágio e humor saem das conclusões, como a sequência.
ALTER TABLE "User" ADD COLUMN "companheiroNome" TEXT;
ALTER TABLE "User" ADD COLUMN "companheiroDesde" TIMESTAMP(3);
