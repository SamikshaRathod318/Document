import { DatabaseService } from './core/services/database.service';

// Usage example
async function testFetchUser(db: DatabaseService) {
  const user = await db.fetchUserByEmail('samiksharathod618@gmail.com');
  console.log(user);
}