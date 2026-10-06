import type { SpecimenLang } from '../settings'

export interface Sample {
  nav: [string, string, string, string]
  title: string
  deck: string
  cardTitle: string
  cardLead: string
  rubyBase: string
  rubyText: string
  cardTail: string
  cardMeta: string
  buttons: [string, string, string]
  fieldLabel: string
  fieldValue: string
  fieldHelp: string
}

export const samples: Record<SpecimenLang, Sample> = {
  en: {
    nav: ['Home', 'Library', 'Pricing', 'Account'],
    title: 'See what breaks when the UI speaks Japanese',
    deck: 'A column sized for English keeps its line-height, its font, and its idea of a phrase. Figma screens for October 2026 still have to hold Japanese in that same frame.',
    cardTitle: 'Line endings are a design decision',
    cardLead: 'Typesetting rules are not decoration. A closing mark, a Latin word such as ',
    rubyBase: 'Figma',
    rubyText: '',
    cardTail: ', and a short label all shift when the language changes.',
    cardMeta: '12 min read',
    buttons: ['Save', 'Cancel', 'Continue'],
    fieldLabel: 'Email',
    fieldValue: 'you@studio.com',
    fieldHelp: 'We only use this to send a preview before launch.',
  },
  ja: {
    nav: ['ホーム', '作品', '料金', '口座'],
    title: '「行頭禁則」を忘れると、見出しから信頼が落ちる。',
    deck: 'FigmaでUIを作るとき、2026年10月の画面は英語の行送りのまま崩れます。行頭に句読点が来て、行末の「括弧」が次の行へ送られ、最後の一行には一文字だけが残ります。',
    cardTitle: '行末は設計の一部です。',
    cardLead: '閉じ括弧」が行頭に来ると、',
    rubyBase: '組版',
    rubyText: 'くみはん',
    cardTail: 'の信頼が落ちます。料金のボタンも、英語より短くなった「次へ」でスカスカになります。',
    cardMeta: '12分',
    buttons: ['保存', '取消', '次へ'],
    fieldLabel: 'メール',
    fieldValue: 'you@studio.com',
    fieldHelp: '公開前の確認だけに使います。宛先は「プレビュー」用です。',
  },
}
