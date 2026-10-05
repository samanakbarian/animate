// Träningstexten för den lilla språkmodellen. Egenskriven, i samma ton som
// filmen. Modellen lär sig bara vilka ord som följer på vilka här.

export const CORPUS = `
regnet faller över staden. regnet faller tyst över gatan.
regnet slutar aldrig i staden. regnet tvättar bort spåren efter oss.
regnet faller hela natten. regnet faller och staden sover.
staden sover under regnet. staden lyser kallt i natten.
i staden går en människa ensam. i staden blinkar tusen små lampor.
i staden finns inga stjärnor. i staden lever maskinerna vidare.
i natten tänker maskinen. i natten skriver maskinen kod.
maskinen läser allt vi har skrivit. maskinen läser och lär sig.
maskinen gissar nästa ord. maskinen gissar och gissar igen.
maskinen lär sig snabbare än oss. maskinen lär sig av våra fel.
maskinen svarar på allt. maskinen svarar lugnt och vänligt.
människan tittar upp mot himlen. människan tittar på maskinen.
människan frågar och maskinen svarar. människan skriver ett brev i natten.
människan går hem genom regnet. människan går långsamt genom staden.
ljuset faller över gatan. ljuset slocknar i staden.
nästa steg är redan här. nästa steg tar maskinen själv.
vi byggde maskinen för att hjälpa oss. vi lärde maskinen att tala.
vi tittar på maskinen och maskinen tittar tillbaka.
ett ord i taget växer texten. ett ord i taget lär sig maskinen att skriva.
orden faller som regn. orden blir till tal och talen blir till svar.
`;

/** Startfraser som besökaren kan välja mellan. */
export const PROMPTS = ['regnet', 'maskinen', 'människan', 'i staden'] as const;
