import { RowDataPacket } from 'mysql2';
import connection from '../config/connection';
import { exec } from 'child_process';
import userRepository from '../repository/user';
import { RatingCreate } from '../domain/rating/ratingCreate';
import { ratingService } from '../service/rating';
import { getYesterday } from './getDate';
import userService from '../service/user';
import { roundService } from '../service/round';

// { level: 0, solved: 0, tried: 0, partial: 0, total: 7174 }
interface UserBojInfo {
  handle: String;
  bio: String;
  badgeId: String;
  backgroundId: String;
  profileImageUrl: String;
  solvedCount: number;
  voteCount: number;
  tier: number;
  rating: number;
  ratingByProblemsSum: number;
  ratingByClass: number;
  ratingBySolvedCount: number;
  ratingByVoteCount: number;
  class: number;
  classDecoration: String;
  rivalCount: number;
  reverseRivalCount: number;
  maxStreak: number;
  coins: number;
  stardusts: number;
  joinedAt: String;
  bannedUntil: String;
  proUntil: String;
  rank: 104;
  isRival: true;
  isReverseRival: true;
}

export async function refreshRating() {
  try {
    if (!(await roundService.getCurrentRound())) {
      await roundService.save({ name: 'start' });
    }
    const result = await userService.findAll();
    const currentRound = await roundService.getCurrentRound();
    if (!result || !currentRound) return;
    for (let i = 0; i < result.length; i++) {
      const user = result[i];
      const todayRating = await fetch('https://solved.ac/api/v3/user/show?handle=' + user.baekjoonName);
      if (todayRating.status !== 200) continue;
      const todayRatingJson: UserBojInfo = await todayRating.json();
      const ratingCreateDto: RatingCreate = {
        userId: user.id,
        roundId: currentRound.id,
        solvedCount: todayRatingJson.solvedCount,
        solvedCountWeight: todayRatingJson.ratingByProblemsSum,
        tier: todayRatingJson.tier,
      };
      const res = await ratingService.save(ratingCreateDto);
    }
  } catch (err) {
    console.log(err);
  }
}
