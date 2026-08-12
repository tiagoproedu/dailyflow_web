# Gamificação do DailyFlow — proposta com base em evidência

Este documento existe porque a decisão "copiar o Habitica" tem um problema documentado.
Abaixo está o que a pesquisa mostra, o que isso implica para o design, e a proposta final.

## 1. O que a ciência diz

### 1.1 Quanto tempo leva para formar um hábito

Lally et al. (UCL, 2009) acompanharam 96 pessoas formando um hábito novo e mediram
automaticidade auto-relatada.

- Média: **66 dias**.
- Variação real: **de 18 a 254 dias**. A média esconde quase tudo — beber um copo de água
  virou automático rápido; fazer 50 abdominais antes do café demorou muito.
- **Achado mais importante para nós: falhar um único dia não reduziu a chance de formar o
  hábito.**

> Isso derruba a mecânica de "perdeu um dia, perdeu tudo". Punir uma falha isolada não é
> só desagradável — contraria o que os dados mostram.

### 1.2 O que faz um hábito pegar: intenções de implementação

Planos no formato **"se/quando X, então eu faço Y"** (Gollwitzer, 1999) ligam um gatilho
concreto a uma resposta, reduzindo a dependência de força de vontade na hora H.

- Aumentam a chance de atingir a meta em até ~2x.
- Em atividade física, efeitos pequenos mas duráveis (d = .14 a .31), mantidos mesmo após
  o fim do contato com os pesquisadores.
- Ressalva: quando a vontade de fazer é baixa, o efeito é fraco. O plano ajuda quem já
  quer; não cria a vontade.
- *Habit stacking* ("depois do café, eu medito") é um caso particular disso, apoiado em
  rotinas que já existem.

> Implicação direta: um hábito no DailyFlow **não pode ser só um nome**. Precisa de gatilho.

### 1.3 Por que procrastinamos: Teoria da Motivação Temporal

A TMT (Steel & König) integra teoria da expectativa, desconto hiperbólico e teoria da
necessidade em uma equação:

```
Motivação = (Expectativa × Valor) / (Impulsividade × Atraso)
```

Para vencer a procrastinação você mexe nos termos que controla:

| Termo | Como o app pode agir |
|---|---|
| **Atraso** ↓ | Trazer a recompensa e o prazo para hoje. Metas grandes viram microtarefas de hoje. |
| **Expectativa** ↑ | Fatiar até a tarefa ser obviamente possível ("2 minutos"). Confiança em conseguir. |
| **Valor** ↑ | Ligar a tarefa a um motivo escrito pelo próprio usuário. |
| **Impulsividade** ↓ | Controle de estímulo: remover gatilhos de distração, deixar pistas da tarefa à vista. |

Autorregulação (controle de atenção, regulação de energia e automaticidade) explica **74%
da variância** em procrastinação. E há um achado barato e forte: **ensinar a pessoa que a
procrastinação é o resultado de uma equação, não um defeito de caráter, produz efeito
visível já na primeira semana — com cerca de 90 segundos de explicação.**

> Implicação: vale colocar essa explicação dentro do app, uma vez, no onboarding.

Limite honesto: a TMT prevê menos bem para procrastinação clínica, depressão, TDAH ou
rotinas estruturalmente caóticas.

### 1.4 O problema do Habitica

Aqui está a parte incômoda. O **efeito de sobrejustificação**: quando você passa a receber
recompensa externa por algo que já fazia por gosto, o interesse intrínseco cai — e
despenca quando a recompensa some.

- Recompensas tangíveis minam consistentemente a motivação intrínseca.
- Pontos, medalhas e streaks introduzidos em tarefas que a pessoa gostava reduzem o gosto
  por elas.
- Um estudo recente concluiu que **o sistema de pontos do Habitica é ativamente prejudicial**.
- Ênfase excessiva em recompensa externa tende a reduzir o engajamento de longo prazo —
  exatamente o oposto do objetivo.

> O paradoxo: a gamificação desenhada para motivar pode destruir a motivação.

## 2. O que isso significa para o DailyFlow

Não é "não faça gamificação". É **onde** aplicá-la.

**Regra central: recompensa externa só onde não existe motivação intrínseca para minar.**

- Tarefa chata, adiada, de atrito (declaração de imposto, academia no dia frio) → gamificar
  ajuda. Não há gosto intrínseco para destruir.
- Atividade que você já gosta (ler, tocar violão, programar por prazer) → **não** gamificar.
  O app deve deixar você marcar um hábito como "faço por gosto" e ele para de dar pontos.

Essa única distinção é o que separa este design do Habitica.

## 3. Proposta

### 3.1 O que fica do Habitica

**Moedas + loja de recompensas definidas por você.** Esta é a melhor mecânica do Habitica e
escapa da sobrejustificação: a recompensa não é imposta de fora, é um contrato que você
faz consigo mesmo ("500 moedas = uma noite de jogo sem culpa"). Você escolhe o prêmio e o
preço.

**XP e níveis** — mas por **consistência**, não por volume. Fazer 20 tarefas num dia de
euforia vale menos que fazer 3 por dia durante uma semana. Isso premia o comportamento que
realmente forma hábito.

### 3.2 O que muda em relação ao Habitica

| Habitica | DailyFlow | Por quê |
|---|---|---|
| HP: você toma dano ao falhar | **Sem dano.** | Falhar um dia não atrapalha a formação do hábito (Lally). Punir é contra a evidência. |
| Streak zera na primeira falha | **Tolerância: 1 falha grátis por semana.** O streak sobrevive. | Mesmo motivo. |
| Streak como número único | Streak **+ "consistência dos últimos 30 dias" (%)**. | Uma falha derruba o streak a zero, mas quase não mexe nos 30 dias. Mostra a verdade: você não perdeu tudo. |
| Pontos para tudo | **Marcar hábito como "faço por gosto"** → sem pontos. | Evita a sobrejustificação onde ela machuca. |
| — | **Barra de automaticidade** (dias de repetição, com a faixa 18–254 explicada). | Dá horizonte realista e transforma a espera em progresso visível. |

### 3.3 O que é novo, vindo da pesquisa

**Gatilho obrigatório no hábito.** Ao criar um hábito, dois campos a mais:
`quando` (gatilho) e `então` (ação). A tela mostra a frase montada:
*"Quando eu terminar o café da manhã, então eu vou ler 10 páginas."*
É a intervenção com melhor suporte científico de toda esta lista, e hoje o app não tem.

**Microtarefa de 2 minutos.** Ao criar uma meta grande, o app pergunta:
*"Qual é o menor primeiro passo que você tem certeza absoluta de que consegue fazer hoje?"*
Isso ataca Expectativa (↑) e Atraso (↓) da equação da TMT ao mesmo tempo.

**Onboarding de 90 segundos** explicando a equação da procrastinação. Barato, e é uma das
intervenções com melhor custo-benefício encontrada.

### 3.4 Sobre os "lembretes implacáveis" da ideia original

Recomendo trocar por **controle de estímulo**: em vez de o app insistir até você ceder
(que gera resistência e faz a pessoa desinstalar), ele destaca a pista da tarefa no
momento do gatilho que **você mesmo** definiu. A evidência apoia pista no momento certo,
não volume de notificação.

## 4. Ordem sugerida de implementação

1. Gatilho (`quando`/`então`) nos hábitos — maior efeito, menor esforço.
2. Consistência 30 dias + tolerância de 1 falha no streak.
3. Moedas + loja de recompensas próprias.
4. XP e níveis por consistência.
5. Microtarefas de 2 minutos nas metas.
6. Onboarding da equação da procrastinação.

## Fontes

- [How long does it take to form a habit? — UCL News (Lally et al.)](https://www.ucl.ac.uk/news/2009/aug/how-long-does-it-take-form-habit)
- [How Long To Form A Habit? 66 Days Is A Rough Average — PsyBlog](https://www.spring.org.uk/2024/11/form-habit-66.php)
- [Instant habits versus flexible tenacity: Do implementation intentions accelerate habit formation? — PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10585941/)
- [Reinforcing implementation intentions with imagery increases physical activity habit strength — PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11920387/)
- [Habit Stacking vs Implementation Intentions — HabitDex](https://habitdex.com/compare/habit-stacking-vs-implementation-intentions)
- [Temporal Motivation Theory: Procrastination Equation — Yu-kai Chou](https://yukaichou.com/behavioral-analysis/temporal-motivation-theory-steel-konig-procrastination/)
- [Examining Procrastination Across Multiple Goal Stages: A Longitudinal Study of Temporal Motivation Theory — Frontiers in Psychology](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2018.00327/full)
- [Now I feel like I'm going to get to it soon: a brief, scalable intervention for state procrastination — BMC Psychology](https://link.springer.com/article/10.1186/s40359-025-03388-3)
- [Overjustification Effect Explained: Why Rewards Kill Motivation](https://theberrybits.com/overjustification-effect)
- [Motivation crowding effects on the intention for continued use of gamified fitness apps — PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10807424/)
- [Motivation Traps in Reward-Based Gamification Campaigns — Yu-kai Chou](https://yukaichou.com/gamification-study/motivation-traps-rewardbased-gamification-campaigns/)
