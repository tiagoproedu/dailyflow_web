# Engajamento — o que os apps que viciam fazem, e o que dá para roubar

Este documento responde a uma pergunta direta: *o que Instagram, TikTok, Duolingo e
companhia têm em comum, e como usar isso para fazer alguém criar um hábito em vez de
perder a tarde?*

Ele é o par de `gamificacao.md`. Aquele diz **o que recompensar**; este diz **como o app
prende**.

## 0. A inversão que decide tudo o resto

Instagram e TikTok otimizam **tempo dentro do app**. O DailyFlow tem de otimizar o
contrário: a sessão ideal dura oito segundos — você abre, marca, sai e vai viver.

Isso parece invalidar o modelo deles. Não invalida. Invalida **uma** peça dele (as que
esticam a sessão). Todo o resto é reaproveitável, e é aí que está o valor.

O motor por trás desses apps é o **Hook Model** (Nir Eyal), quatro fases em ciclo:

```
Gatilho  →  Ação  →  Recompensa variável  →  Investimento  →  (volta ao gatilho)
```

A diferença entre eles e nós é **onde a Ação acontece**:

| | Ação | O que o app faz |
|---|---|---|
| TikTok | acontece **na tela** (rolar) | o app é gatilho, ação, recompensa e investimento |
| DailyFlow | acontece **na sua vida** (ler, treinar, estudar) | o app é só gatilho, recompensa e investimento |

Daí a regra que governa este documento:

> **O app não pode ser a recompensa. O app é o recibo.**

Toda mecânica abaixo passa por esse filtro. Se ela faz você querer usar o app, é ruim. Se
ela faz você querer *ter feito a coisa*, é boa.

## 1. As mecânicas, uma a uma

### 1.1 Recompensa variável

O núcleo. Skinner mostrou que reforço em **razão variável** (a recompensa vem, mas você
não sabe quando nem qual) produz comportamento muito mais persistente que reforço fixo —
é o mesmo esquema do caça-níquel. O `pull-to-refresh` é literalmente a alavanca: você puxa
e não sabe o que vem.

**Serve?** Serve, e é o mais subestimado. Hoje, marcar um hábito no DailyFlow não devolve
absolutamente nada — o número muda e acabou. Um comportamento que não produz consequência
percebida não se reforça.

**Como fica aqui:** o momento da marcação responde algo, e não a mesma coisa sempre. A
variação é no *reconhecimento*, não em prêmio sorteado — o que varia é a frase, o marco
que ela nota, o modo como o app percebe onde você está. Nada de loteria.

### 1.2 Aversão à perda / sequência

Kahneman: perder dói cerca de duas vezes mais do que ganhar agrada. O Snapstreak e o
streak do Duolingo são aversão à perda pura — e são, provavelmente, a mecânica de hábito
mais eficaz já implantada em escala.

**Serve, com freio.** O lado escuro é documentado: ansiedade de sequência, e o abandono
total no dia seguinte à quebra. Duolingo teve de inventar o *streak freeze* para tapar
esse buraco.

**Como fica aqui:** já decidido em `gamificacao.md` — **uma falha grátis por semana**, e a
sequência aparece sempre ao lado da **consistência de 30 dias**, que uma falha quase não
move. O número que dói vem acompanhado do número que diz a verdade.

### 1.3 Fricção zero

O TikTok não tem tela de escolha. Não tem busca obrigatória, não tem "montar playlist":
abre e já está tocando. Cada passo entre a intenção e a ação perde gente.

**Serve — e é o maior ganho ainda não explorado aqui.** Hoje, para marcar um hábito você
precisa: ver a notificação, desbloquear, abrir o app, esperar carregar, achar o hábito,
tocar. São seis passos para registrar algo que levou dois segundos para fazer.

**Como fica aqui:** botão **"Feito ✓" dentro da própria notificação**. Zero navegação, app
nunca abre. É a tradução mais literal e mais honesta do TikTok para este app.

### 1.4 Efeito Zeigarnik (o incompleto incomoda)

Tarefa começada e não terminada ocupa a memória. É por isso que o LinkedIn mostra "perfil
85% completo" e que o app tem sempre um badge vermelho com número.

**Serve.** "2 de 3 hoje" pesa mais que "2 hábitos feitos". A barra é o que cobra.

### 1.5 Progresso dotado (*endowed progress*)

Nunes & Drèze: um cartão de fidelidade com 10 espaços e 2 já carimbados é completado com
muito mais frequência que um de 8 espaços vazios. Progresso já iniciado motiva; começar do
zero, não.

**Serve.** Ninguém deve encarar uma tela de zeros. Quem acabou de criar um hábito já está
no dia 1 de uma coisa, não em "0".

### 1.6 Retorno imediato e sensorial

O coração que pula no Instagram, o som e a animação do Duolingo, a vibração do celular. O
reforço tem de chegar **junto** com a ação — pouco mais de um segundo de atraso e o
cérebro já não liga uma coisa à outra.

**Serve, e é o buraco mais gritante do DailyFlow hoje.** Marcar um hábito é silencioso,
sem animação e sem retorno tátil.

### 1.7 Gatilho externo virando gatilho interno

Eyal: o app começa cutucando de fora (notificação) e o objetivo é que o gatilho migre para
dentro — tédio, ansiedade, e a mão vai sozinha no ícone.

**Serve, e já começou.** O push na hora do `cueTime` é o gatilho externo. A diferença de
propósito é radical: **o sucesso aqui é a notificação virar desnecessária.** No Instagram,
nunca.

### 1.8 Curadoria ("o app sabe o que eu quero")

O algoritmo do TikTok não te dá o catálogo, dá *o próximo vídeo*.

**Serve na versão honesta:** mostrar **a próxima coisa**, não a lista inteira. Uma lista de
doze itens é uma decisão a tomar; uma decisão a tomar é onde a procrastinação mora.

### 1.9 Investimento acumulado

Quanto mais você põe no app (dados, histórico, ajustes), mais caro fica sair. Nos apps de
atenção isso é aprisionamento.

**Serve na versão honesta:** o histórico é *seu* e é o produto. O gráfico de contribuições
do GitHub é o exemplo limpo — ninguém se sente manipulado por ele, e mesmo assim ele move
comportamento.

### 1.10 Efeito de recomeço (*fresh start effect*)

Milkman: segunda-feira, dia 1º, aniversário — marcos temporais reabrem a disposição de
tentar de novo.

**Serve, e é o antídoto do 1.2.** O momento de maior abandono em qualquer app de hábito é
o dia seguinte à quebra da sequência. É exatamente ali que o app tem de oferecer um marco,
não um velório.

### 1.11 Social (comparação, ranking, sequência compartilhada)

A mecânica mais forte de todas e a mais tóxica. Snapstreak é aversão à perda **social**.

**Não, por enquanto** — o app tem um usuário. E a versão saudável não é ranking: é *uma*
pessoa de confiança que enxerga o mesmo painel.

### 1.12 Rolagem infinita, autoplay, ausência de ponto de parada

**Não. Nunca.** É a única mecânica cujo objetivo é logicamente incompatível com o do app.
Todas as outras podem ser reorientadas; esta existe só para consumir tempo. Aqui vale o
inverso: o app deve ter **fim visível** — quando acabou o dia, a tela diz que acabou.

### 1.13 Medalhas e coleções

**Cuidado.** É onde bate a sobrejustificação (`gamificacao.md` §1.4): recompensa externa em
cima do que já se fazia por gosto **reduz** o gosto. Só onde não existe motivação
intrínseca para destruir — daí o campo `intrinsic` já existir no `Habit`.

### 1.14 Notificação por volume

"Sentimos sua falta", "você tem 3 novidades", cutucão diário sem conteúdo.

**Não.** Já decidido: pista **na hora do gatilho que você mesmo definiu**, não insistência.
A evidência apoia o momento certo, não a quantidade.

## 2. Resumo: o que roubar e o que recusar

| Mecânica | Roubar? |
|---|---|
| Recompensa variável no momento da ação | ✅ sem loteria: o que varia é o reconhecimento |
| Sequência / aversão à perda | ✅ com 1 falha grátis por semana e a consistência ao lado |
| Fricção zero | ✅ marcar direto da notificação |
| Zeigarnik (progresso incompleto) | ✅ |
| Progresso dotado | ✅ nunca mostrar zero |
| Retorno imediato (animação, háptico) | ✅ |
| Gatilho externo → interno | ✅ com a meta invertida: virar dispensável |
| Curadoria: a próxima coisa | ✅ |
| Investimento / histórico | ✅ o histórico é seu |
| Efeito de recomeço | ✅ obrigatório junto com a sequência |
| Social | ⏸ um usuário só; se vier, é confiança, não ranking |
| Medalhas / coleção | ⚠️ só onde não há gosto intrínseco |
| Rolagem infinita, autoplay | ❌ incompatível por definição |
| Notificação por volume | ❌ |

## 3. Onde o DailyFlow está furado hoje

1. **Marcar não devolve nada.** O ciclo nunca fecha — não há Recompensa no Hook. É o
   conserto de maior efeito por menos código.
2. **Não existe nada a perder.** Sem sequência visível, não há aversão à perda. O campo
   `currentStreak` existia no banco e ninguém escrevia nele: a API devolvia `0` para
   sempre.
3. **Marcar custa seis passos.** A notificação já chega no momento certo e ainda assim
   exige abrir o app inteiro para registrar dois segundos de ação.

## 4. Plano

**Fase 1 — fechar o ciclo** *(feita)*
- Sequência real, com tolerância de uma falha por semana
- Consistência de 30 dias ao lado da sequência
- Barra de automaticidade (dias de repetição, faixa 18–254 de Lally)
- Momento da marcação: animação, vibração e reconhecimento variável
- Sequência dentro da notificação de lembrete

**Fase 2 — tirar a fricção**
- Botão "Feito ✓" na própria notificação (§1.3)
- Aviso de sequência em risco no fim do dia, só quando há sequência a perder
- Tela de recomeço depois de uma quebra (§1.10), em vez de silêncio

**Fase 3 — o resto de `gamificacao.md`**
- Moedas + loja de recompensas definidas por você
- Microtarefa de 2 minutos nas metas
- Onboarding de 90 segundos sobre a equação da procrastinação

## 5. Regras que não se quebram

1. **Nenhum número é inventado.** Vale aqui a mesma regra de "nada de tela falsa": se a
   sequência é 3, escreve 3. Elogio inflacionado deixa de significar qualquer coisa.
2. **Nada pune.** Sem dano, sem vermelho acusatório, sem "você falhou". Falhar um dia não
   atrapalha a formação do hábito (Lally) — o app não pode discordar dos dados.
3. **Nenhuma mecânica pode aumentar o tempo de sessão.** Se uma ideia faz você ficar mais
   tempo no app, ela está errada por construção, por melhor que pareça.
4. **Recompensa externa só onde não há motivação intrínseca** (`gamificacao.md` §2).
5. **A sequência nunca aparece sozinha.** Sempre acompanhada da consistência, que é o
   número que sobrevive a um dia ruim.

## Fontes

- Nir Eyal, *Hooked: How to Build Habit-Forming Products* — o modelo Gatilho → Ação →
  Recompensa Variável → Investimento
- B. F. Skinner — esquemas de reforço em razão variável
- Kahneman & Tversky, *Prospect Theory* — aversão à perda
- Nunes & Drèze, *The Endowed Progress Effect* (Journal of Consumer Research, 2006)
- Dai, Milkman & Riis, *The Fresh Start Effect* (Management Science, 2014)
- Lally et al. (UCL, 2009) — 66 dias em média, faixa de 18 a 254; falhar um dia não
  atrapalha. Ver `gamificacao.md`.
- Gollwitzer (1999) — intenções de implementação. Ver `gamificacao.md`.
