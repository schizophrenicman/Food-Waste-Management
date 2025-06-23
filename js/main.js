document.addEventListener('DOMContentLoaded',function(){
    const storage = new StorageManager();
    const auth = new AuthManager(storage);
    const admin = new DashboardManager(storage,auth);
    const reviews = new ReviewManager(storage,auth);
    

})