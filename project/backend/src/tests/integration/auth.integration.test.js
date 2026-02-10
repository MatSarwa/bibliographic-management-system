const request = require('supertest');
const app = require('../../app'); 

const { User, sequelize } = require('../../models'); 
const bcrypt = require('bcrypt');

const TEST_USER_DATA = {
    username: 'integration.user',
    email: 'integration.test@test.com',
    password: 'IntegrationPass123'
};

describe('AUTH INTEGRATION: Rejestracja (POST /auth/register)', () => {

    beforeAll(async () => {
        try {
            await sequelize.sync({ force: true });
            console.log("Sequelize: Test database synchronized.");
        } catch (error) {
            console.error("Sequelize Synchronization Error:", error);
            throw error; 
        }
    });

    afterEach(async () => {
        await User.destroy({ where: {} });
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('should return 201 (Created) and correctly save user to the database', async () => {
        
        const response = await request(app)
            .post('/api/auth/register')
            .send(TEST_USER_DATA);

        expect(response.statusCode).toBe(201);
        expect(response.body.user.email).toBe(TEST_USER_DATA.email);
        expect(response.body.verificationToken).toBeDefined(); 

        const userInDb = await User.findOne({ where: { email: TEST_USER_DATA.email } });
        expect(userInDb).not.toBeNull();
        
        const isPasswordCorrect = await bcrypt.compare(TEST_USER_DATA.password, userInDb.password);
        expect(isPasswordCorrect).toBe(true);
        expect(userInDb.isVerified).toBe(false);
    });

    it('should return 400 (Bad Request) if the email already exists in DB', async () => {
        
        await User.create({
            username: 'ExistingUser',
            email: TEST_USER_DATA.email,
            password: await bcrypt.hash('pass', 10) 
        });

        const response = await request(app)
            .post('/api/auth/register')
            .send(TEST_USER_DATA);

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Email już jest używany');
        
        const count = await User.count({ where: { email: TEST_USER_DATA.email } });
        expect(count).toBe(1); 
    });
});