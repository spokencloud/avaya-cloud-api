export interface SkillCreateRequest {
  name: string
  skillNumber: number
  subAccountAppId: string
  acwInterval: number | null
  slaInSeconds: number | null
  slaPercentage: number | null
  announcementExtension: string | null
  redirectOnNoAnswerRings: bigint | null
  chatDigitalChannelsEnabled: boolean | null
  emailDigitalChannelsEnabled: boolean | null
  smsDigitalChannelsEnabled: boolean | null
}
