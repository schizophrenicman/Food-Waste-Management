// Authentication system
class AuthManager {
  constructor(storage) {
    this.storage = storage;
    this.currentUser = null;
    this.currentAdmin = null;
  }
}