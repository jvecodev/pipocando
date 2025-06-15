export enum PostTypeEnum {
  NEWS = 'news',
  REVIEW = 'review', 
  LISTICLE = 'listicle',
  GENERAL = 'general'
}

export const POST_TYPE_LABELS = {
  [PostTypeEnum.NEWS]: 'Notícias',
  [PostTypeEnum.REVIEW]: 'Resenhas',
  [PostTypeEnum.LISTICLE]: 'Listas',
  [PostTypeEnum.GENERAL]: 'Geral'
};
