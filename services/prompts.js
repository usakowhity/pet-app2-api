// モード一覧と対応:
// n2: お座り
// n3: 寝んね
// p1: 遊ぶ
// p2: 喜び（※動画は別ルートで）
// p3: 伏せ
// p4: お手
// p5: ごはん
// p6: お水
// p7: トイレ
// p8: 持ってこい
// p9: ハウス

const MODE_PROMPTS = {
  n2: "sitting politely, front legs straight, calm and stable pose, looking gently toward the camera",
  n3: "lying down and sleeping, eyes closed, relaxed body, peaceful and cozy pose on a soft surface",
  p1: "playing happily, active body movement, playful pose, toy or ball nearby, joyful atmosphere",
  p2: "very happy expression, bright eyes, slightly open mouth as if smiling, whole body showing joy",
  p3: "lying down with front legs stretched forward, chest close to the ground, classic 'down' pose",
  p4: "sitting and raising one front paw toward the viewer, as if giving a paw, friendly and obedient pose",
  p5: "sitting or standing near a food bowl, looking at the bowl or the viewer with expectation, mealtime atmosphere",
  p6: "near a water bowl, looking at the bowl or drinking water, refreshing and clean feeling",
  p7: "near a toilet area or pet toilet sheet, slightly cautious or focused expression, natural daily-life scene",
  p8: "holding or bringing a toy or ball in the mouth, returning toward the viewer, 'fetch' action in motion",
  p9: "inside or just in front of a pet house, crate, or bed, calm and settled pose, feeling of 'home'"
};

// 種類別の補正（犬/猫/うさぎ）
const SPECIES_STYLE = {
  dog: "a cute dog, realistic fur texture, expressive eyes, natural proportions",
  cat: "a cute cat, soft fluffy fur, graceful body, gentle eyes",
  rabbit: "a cute rabbit, fluffy ears, round body, soft fur texture"
};

// n1（代表画像）を参照する構文
function referenceN1(n1Url) {
  return `Use the pet's appearance from this reference image: ${n1Url}. Match the same face, fur color, and overall look.`;
}

// モード別プロンプト生成
export function buildPrompt(modeId, species, n1Url) {
  const base = MODE_PROMPTS[modeId] || "cute pet portrait in a simple pose";
  const speciesStyle = SPECIES_STYLE[species] || "cute pet";
  const ref = referenceN1(n1Url);

  return `
${speciesStyle}.
${base}.
${ref}.
High quality, photorealistic, soft natural lighting, clean simple background.
  `.trim();
}