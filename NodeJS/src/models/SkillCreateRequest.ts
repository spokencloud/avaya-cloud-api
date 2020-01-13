export interface SkillCreateRequest {
    name: string,
    number: number,
    clientId: number,
    skillType: string,
    acwInterval: number | null,
    slaInSeconds: number | null,
    slaPercentage: number | null,
    announcementExtension: string | null
}
