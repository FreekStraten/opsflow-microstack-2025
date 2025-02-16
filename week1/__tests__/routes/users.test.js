const { ExpectationFailed } = require('http-errors'); // (Niet noodzakelijk voor deze test, maar kan worden gebruikt voor foutafhandeling)

const request = require('supertest'); // Supertest maakt HTTP-verzoeken mogelijk in je tests
const app = require('../../app'); // Haal je Express-applicatie op (zorg dat dit pad klopt)

const { db, client } = require('../../services/database'); // Haal je database-verbinding op

describe('Get Users', () => {
    // Voordat elke test draait, maken we de 'users' collection leeg
    beforeEach(async () => {
        await db.collection('users').deleteMany({});
    });

    // Na alle tests sluiten we de database-verbinding netjes af
    afterAll(async () => {
        client.close();
    });

    // Definieer een test voor het ophalen van gebruikers
    it('should get all users in array', async () => {
        // Maak een object dat je als testgebruiker wilt invoegen
        const expected = { 'foo': 'bar' };

        // Voeg dit object toe aan de 'users' collection
        await db.collection('users').insertOne(expected);

        // Omdat MongoDB automatisch een _id toevoegt aan documenten, verwijderen we die uit ons verwachte object voor de vergelijking
        delete expected._id;

        // Doe een GET-request naar de /users route met Supertest
        const res = await request(app).get('/users');

        // Controleer dat de statuscode 200 (OK) is
        expect(res.statusCode).toEqual(200);

        // Controleer dat er precies één user in de response zit (de array lengte is 1)
        expect(res.body.length).toEqual(1);

        // Controleer dat het eerste object in de array de eigenschappen bevat zoals in expected
        expect(res.body[0]).toEqual(expect.objectContaining(expected));
    });
});
