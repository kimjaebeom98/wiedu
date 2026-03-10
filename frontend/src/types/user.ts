/**
 * 근처 활동중인 멤버
 */
export interface NearbyMember {
  id: number;
  nickname: string;
  profileImage: string | null;
  badge: string | null;      // 뱃지 이모지 (예: "🏆")
  badgeColor: string | null; // 뱃지 색상 (예: "#F59E0B")
}
