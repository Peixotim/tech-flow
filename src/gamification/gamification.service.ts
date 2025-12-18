import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(private readonly usersService: UsersService) {}

  private getXpForNextLevel(currentLevel: number): number {
    return Math.floor(1000 * Math.pow(1.5, currentLevel - 1));
  }

  public async addExperience(userUuid: string, xpAmount: number) {
    const user = await this.usersService.findByUuid(userUuid);
    if (!user) return;

    let newXp = (user.experiencePoints || 0) + xpAmount;
    let currentLevel = user.level || 1;
    let leveledUp = false;
    let xpNeeded = this.getXpForNextLevel(currentLevel);

    while (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      currentLevel++; // Sobe de nivel !
      leveledUp = true;

      xpNeeded = this.getXpForNextLevel(currentLevel);
    }

    await this.usersService.updateStats(user.uuid, newXp, currentLevel);

    if (leveledUp) {
      this.logger.log(
        `🎉 User ${user.name} leveled up to Level ${currentLevel}!`,
      );
      await this.processLevelUnlocks(user.uuid, currentLevel);
    }

    return {
      currentLevel,
      currentXp: newXp,
      xpForNextLevel: xpNeeded,
      leveledUp,
    };
  }

  /**
   * Defines which items are unlocked at each level.
   */
  private async processLevelUnlocks(userUuid: string, level: number) {
    const newItems: string[] = [];

    // --- REWARD TABLE ---
    if (level >= 2) newItems.push('glasses_aviator', 'bg_blue_gradient');
    if (level >= 5) newItems.push('suit_gold', 'hat_fedor');
    if (level >= 10) newItems.push('crown_king', 'bg_galaxy');
    if (level >= 20) newItems.push('pet_panda_robot');

    if (newItems.length > 0) {
      await this.usersService.addUnlockedItems(userUuid, newItems);
      this.logger.log(
        `🎁 Unlocked items for user ${userUuid}: ${newItems.join(', ')}`,
      );
    }
  }
}
