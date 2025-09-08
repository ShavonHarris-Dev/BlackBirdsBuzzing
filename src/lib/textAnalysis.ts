export function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, '')
    .split(/\s+/)
    .filter(word => word.length > 1)
    .filter(word => !isCommonWord(word));
}

export function getWordFrequency(words: string[]): Record<string, number> {
  const frequency: Record<string, number> = {};
  
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return frequency;
}

export function getUniqueWords(text: string): string[] {
  const words = extractWords(text);
  return Array.from(new Set(words));
}

function isCommonWord(word: string): boolean {
  const commonWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'a', 'an', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'ours',
    'this', 'that', 'these', 'those', 'here', 'there', 'where', 'when', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can'
  ]);
  
  return commonWords.has(word.toLowerCase());
}