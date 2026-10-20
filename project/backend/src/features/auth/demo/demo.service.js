const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { sequelize, User } = require('../../../models');
const { createDemoContent, deleteUserWithData } = require('./demo-content');
const { VISITOR_DEMO_DOMAIN, VISITOR_DEMO_TTL_MS } = require('./demo-accounts');

// Every "Try demo" click gets its own temporary account, so visitors never see each other's changes.
class DemoService {
  // Removes visitor demo accounts older than the TTL. Runs on every new demo, so no scheduler is needed.
  async deleteExpiredVisitorDemos() {
    const expired = await User.findAll({
      where: {
        email: { [Op.like]: `%@${VISITOR_DEMO_DOMAIN}` },
        createdAt: { [Op.lt]: new Date(Date.now() - VISITOR_DEMO_TTL_MS) },
      },
    });

    for (const user of expired) {
      await sequelize.transaction((transaction) => deleteUserWithData(user, transaction));
    }
    return expired.length;
  }

  async createVisitorDemo() {
    await this.deleteExpiredVisitorDemos();

    const suffix = crypto.randomBytes(3).toString('hex');
    const user = await sequelize.transaction(async (transaction) => {
      const created = await User.create({
        username: `demo-${suffix}`,
        email: `demo-${suffix}@${VISITOR_DEMO_DOMAIN}`,
        // Random password nobody knows: the account is only reachable through the returned token.
        password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
        isVerified: true,
      }, { transaction });

      await createDemoContent(created, transaction);
      return created;
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      // The account is deleted after the TTL, so the token must not outlive it.
      { expiresIn: Math.floor(VISITOR_DEMO_TTL_MS / 1000) }
    );

    return { token, user };
  }
}

module.exports = new DemoService();
