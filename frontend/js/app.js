/* جمعيتي - ملف الجافا سكريبت الرئيسي */
// إدارة المصادقة والجلسات
class AuthManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
    }
    // تسجيل مستخدم جديد
    register(username, email, password, confirmPassword) {
        // التحقق من صحة البيانات
        if (!username || !email || !password || !confirmPassword) {
            return { success: false, message: 'جميع الحقول مطلوبة' };
        }
        if (password !== confirmPassword) {
            return { success: false, message: 'كلمات المرور غير متطابقة' };
        }
        if (password.length < 6) {
            return { success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
        }
        // التحقق من وجود المستخدم مسبقاً
        const users = this.getUsers();
        if (users.find(user => user.email === email)) {
            return { success: false, message: 'البريد الإلكتروني مستخدم مسبقاً' };
        }
        // إنشاء المستخدم الجديد
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: btoa(password), // تشفير بسيط
            joinDate: new Date().toISOString(),
            avatar: username.charAt(0).toUpperCase()
        };
        users.push(newUser);
        localStorage.setItem('jamiyati_users', JSON.stringify(users));
        return { success: true, message: 'تم التسجيل بنجاح' };
    }
    // تسجيل الدخول
    login(email, password) {
        if (!email || !password) {
            return { success: false, message: 'البريد الإلكتروني وكلمة المرور مطلوبان' };
        }
        const users = this.getUsers();
        const user = users.find(u => u.email === email && atob(u.password) === password);
        if (!user) {
            return { success: false, message: 'بيانات الدخول غير صحيحة' };
        }
        // حفظ الجلسة
        localStorage.setItem('jamiyati_current_user', JSON.stringify(user));
        this.currentUser = user;
        return { success: true, message: 'تم تسجيل الدخول بنجاح', user };
    }
    // تسجيل الخروج
    logout() {
        localStorage.removeItem('jamiyati_current_user');
        this.currentUser = null;
        window.location.href = 'login_register.html';
    }
    // الحصول على المستخدم الحالي
    getCurrentUser() {
        const userStr = localStorage.getItem('jamiyati_current_user');
        return userStr ? JSON.parse(userStr) : null;
    }
    // الحصول على جميع المستخدمين
    getUsers() {
        const usersStr = localStorage.getItem('jamiyati_users');
        return usersStr ? JSON.parse(usersStr) : [];
    }
    // التحقق من تسجيل الدخول
    isLoggedIn() {
        return this.currentUser !== null;
    }
}
// إدارة الخريطة التفاعلية
class MapManager {
    constructor() {
        this.centers = [];
        this.activeInfo = null;
    }
    // تهيئة الخريطة
    initMap() {
        this.setupMarkers();
        this.bindEvents();
    }
    // إعداد علامات المراكز
    setupMarkers() {
        const mapArea = document.querySelector('.map-area');
        if (!mapArea) return;
        // إزالة العلامات الموجودة
        mapArea.querySelectorAll('.center-marker').forEach(marker => marker.remove());
        mapArea.querySelectorAll('.center-info').forEach(info => info.remove());
        // إضافة علامات جديدة
        this.centers.forEach((center, index) => {
            this.createMarker(center, index);
        });
    }
    // إنشاء علامة مركز
    createMarker(center, index) {
        const mapArea = document.querySelector('.map-area');
        
        // إنشاء العلامة
        const marker = document.createElement('div');
        marker.className = 'center-marker';
        marker.style.top = center.position.top;
        marker.style.right = center.position.right;
        marker.textContent = (index + 1).toString();
        marker.dataset.centerId = index;
        // إنشاء نافذة المعلومات
        const info = document.createElement('div');
        info.className = 'center-info';
        info.innerHTML = `
            <h4>${center.name}</h4>
            <p><strong>العنوان:</strong> ${center.address}</p>
            <p><strong>الهاتف:</strong> ${center.phone}</p>
            <p><strong>ساعات العمل:</strong> ${center.hours}</p>
            <a href="${center.gmaps}" target="_blank" class="maps-link">عرض في خرائط جوجل</a>
        `;
        mapArea.appendChild(marker);
        mapArea.appendChild(info);
        // ربط الأحداث
        marker.addEventListener('click', (e) => {
            this.showCenterInfo(index, e);
        });
    }
    // عرض معلومات المركز
    showCenterInfo(centerId, event) {
        // إخفاء المعلومات المفتوحة
        if (this.activeInfo) {
            this.activeInfo.classList.remove('show');
        }
        // عرض المعلومات الجديدة
        const info = document.querySelectorAll('.center-info')[centerId];
        if (info) {
            const rect = event.target.getBoundingClientRect();
            const mapRect = document.querySelector('.map-area').getBoundingClientRect();
            
            info.style.top = (rect.top - mapRect.top - 10) + 'px';
            info.style.right = (mapRect.right - rect.right - 40) + 'px';
            info.classList.add('show');
            
            this.activeInfo = info;
        }
    }
    // ربط الأحداث
    bindEvents() {
        // إغلاق نوافذ المعلومات عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.center-marker') && !e.target.closest('.center-info')) {
                if (this.activeInfo) {
                    this.activeInfo.classList.remove('show');
                    this.activeInfo = null;
                }
            }
        });
    }
    // إضافة مركز جديد
    addCenter(center) {
        this.centers.push(center);
        this.setupMarkers();
    }
    // تحديث المراكز
    setCenters(centers) {
        this.centers = centers;
        this.setupMarkers();
    }
}
// إدارة واجهة المستخدم
class UIManager {
    constructor() {
        this.authManager = new AuthManager();
        this.mapManager = new MapManager();
    }
    // تهيئة الواجهة
    init() {
        this.checkAuthStatus();
        this.bindEvents();
        this.loadUserInfo();
    }
    // التحقق من حالة المصادقة
    checkAuthStatus() {
        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage === 'login_register.html') {
            if (this.authManager.isLoggedIn()) {
                window.location.href = 'index.html';
            }
        } else {
            if (!this.authManager.isLoggedIn()) {
                window.location.href = 'login_register.html';
            }
        }
    }
    // تحميل معلومات المستخدم
    loadUserInfo() {
        const user = this.authManager.getCurrentUser();
        if (!user) return;
        
        // تحديث الهيدر
        const userAvatar = document.querySelector('.user-avatar');
        const usernameSpan = document.querySelector('.username');
        const userInfo = document.querySelector('.user-info');
        
        if (userAvatar) {
            userAvatar.textContent = user.avatar;
        }
        
        if (usernameSpan) {
            usernameSpan.textContent = user.username;
        }
        
        // إضافة معرف الدور لتطبيق الأنماط المخصصة
        if (userInfo) {
            userInfo.setAttribute('data-role', user.role || 'volunteer');
        }
        
        // إضافة زر إدارة الأدوار للمديرين
        if (user.role === 'admin' && !document.getElementById('roleManagementBtn')) {
            this.addRoleManagementButton();
        }
    }
    
    // إضافة زر إدارة الأدوار
    addRoleManagementButton() {
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            const roleBtn = document.createElement('button');
            roleBtn.id = 'roleManagementBtn';
            roleBtn.className = 'role-management-btn';
            roleBtn.textContent = 'إدارة الأدوار';
            roleBtn.addEventListener('click', () => {
                if (window.roleManager) {
                    window.roleManager.addAdminRoleInterface();
                }
            });
            userInfo.insertBefore(roleBtn, userInfo.querySelector('.logout-btn'));
        }
    }
    // ربط الأحداث
    bindEvents() {
        // تسجيل الخروج
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.authManager.logout();
            });
        }
        // تبديل نماذج تسجيل الدخول/التسجيل
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchAuthTab(btn.dataset.tab);
            });
        });
        // نماذج تسجيل الدخول والتسجيل
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(new FormData(loginForm));
            });
        }
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(new FormData(registerForm));
            });
        }
    }
    // تبديل تبويبات المصادقة
    switchAuthTab(tabName) {
        // تحديث الأزرار
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        // تحديث النماذج
        document.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'none';
        });
        document.getElementById(`${tabName}Form`).style.display = 'block';
    }
    // معالجة تسجيل الدخول
    handleLogin(formData) {
        const email = formData.get('email');
        const password = formData.get('password');
        const result = this.authManager.login(email, password);
        
        if (result.success) {
            this.showAlert('تم تسجيل الدخول بنجاح!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            this.showAlert(result.message, 'error');
        }
    }
    // معالجة التسجيل
    handleRegister(formData) {
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const result = this.authManager.register(username, email, password, confirmPassword);
        
        if (result.success) {
            this.showAlert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول', 'success');
            setTimeout(() => {
                this.switchAuthTab('login');
            }, 1500);
        } else {
            this.showAlert(result.message, 'error');
        }
    }
    // عرض التنبيهات
    showAlert(message, type) {
        // إزالة التنبيهات الموجودة
        document.querySelectorAll('.alert').forEach(alert => alert.remove());
        // إنشاء تنبيه جديد
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        // إضافة التنبيه للصفحة
        const container = document.querySelector('.auth-card') || document.querySelector('.container');
        if (container) {
            container.insertBefore(alert, container.firstChild);
            
            // إزالة التنبيه بعد 5 ثوان
            setTimeout(() => {
                alert.remove();
            }, 5000);
        }
    }
}
// إدارة التنقل والواجهة الجديدة
class NavigationManager {
    constructor() {
        this.currentSection = 'home';
        this.init();
    }
    
    init() {
        this.bindNavigation();
        this.initFilters();
        this.initForms();
    }
    
    bindNavigation() {
        // ربط روابط التنقل
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                this.showSection(sectionId);
                this.setActiveNav(link);
            });
        });
    }
    
    showSection(sectionId) {
        // إخفاء جميع الأقسام
        const sections = document.querySelectorAll('.main-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // عرض القسم المطلوب
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
        }
    }
    
    setActiveNav(activeLink) {
        // إزالة الفئة النشطة من جميع الروابط
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // إضافة الفئة النشطة للرابط المحدد
        activeLink.classList.add('active');
    }
    
    initFilters() {
        // فلاتر دليل المراكز
        const governorateFilter = document.getElementById('governorate-filter');
        const sectorFilter = document.getElementById('sector-filter');
        
        if (governorateFilter && sectorFilter) {
            governorateFilter.addEventListener('change', () => this.filterCenters());
            sectorFilter.addEventListener('change', () => this.filterCenters());
        }
        
        // فلاتر الإشعارات
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setActiveFilter(btn);
                this.filterNotifications(btn.dataset.filter);
            });
        });
    }
    
    filterCenters() {
        const governorate = document.getElementById('governorate-filter').value;
        const sector = document.getElementById('sector-filter').value;
        const centerCards = document.querySelectorAll('.center-card');
        
        centerCards.forEach(card => {
            const cardGovernorate = card.dataset.governorate;
            const cardSector = card.dataset.sector;
            
            const governorateMatch = !governorate || cardGovernorate === governorate;
            const sectorMatch = !sector || cardSector === sector;
            
            if (governorateMatch && sectorMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    setActiveFilter(activeBtn) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }
    
    filterNotifications(filter) {
        const notifications = document.querySelectorAll('.notification-item');
        
        notifications.forEach(notification => {
            const notificationType = notification.dataset.type;
            
            if (filter === 'all' || notificationType === filter) {
                notification.style.display = 'flex';
            } else {
                notification.style.display = 'none';
            }
        });
    }
    
    initForms() {
        // نموذج الاقتراحات والشكاوي
        const suggestionForm = document.getElementById('suggestionForm');
        if (suggestionForm) {
            suggestionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSuggestionSubmission(new FormData(suggestionForm));
            });
        }
    }
    
    handleSuggestionSubmission(formData) {
        const type = document.getElementById('suggestion-type').value;
        const category = document.getElementById('suggestion-category').value;
        const center = document.getElementById('suggestion-center').value;
        const message = document.getElementById('suggestion-message').value;
        
        // محاكاة إرسال الاقتراح
        const suggestion = {
            id: Date.now().toString(),
            type,
            category,
            center,
            message,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        // حفظ في التخزين المحلي
        const suggestions = JSON.parse(localStorage.getItem('jamiyati_suggestions') || '[]');
        suggestions.push(suggestion);
        localStorage.setItem('jamiyati_suggestions', JSON.stringify(suggestions));
        
        // عرض رسالة نجاح
        this.showAlert('تم إرسال رسالتك بنجاح! سيتم مراجعتها والرد عليها قريباً.', 'success');
        
        // إعادة تعيين النموذج
        document.getElementById('suggestionForm').reset();
    }
    
    showAlert(message, type) {
        // إزالة التنبيهات الموجودة
        document.querySelectorAll('.alert').forEach(alert => alert.remove());
        
        // إنشاء تنبيه جديد
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        // إضافة التنبيه للصفحة
        const container = document.querySelector('.suggestions-container') || document.querySelector('.container');
        if (container) {
            container.insertBefore(alert, container.firstChild);
            
            // إزالة التنبيه بعد 5 ثوان
            setTimeout(() => {
                alert.remove();
            }, 5000);
        }
    }
}
// دالة عرض المركز على الخريطة
function showOnMap(centerName) {
    window.location.href = `center-map.html#${centerName}`;
}
// تحسينات إضافية للواجهة
class EnhancedUIManager extends UIManager {
    constructor() {
        super();
        this.navigationManager = new NavigationManager();
    }
    
    init() {
        super.init();
        this.initEnhancements();
    }
    
    initEnhancements() {
        // إضافة تأثيرات تفاعلية للبطاقات
        this.addCardInteractions();
        
        // تحسين تجربة المستخدم
        this.enhanceUserExperience();
    }
    
    addCardInteractions() {
        const cards = document.querySelectorAll('.card, .news-item, .center-card, .department-card, .campaign-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    enhanceUserExperience() {
        // إضافة تحميل تدريجي للمحتوى
        const sections = document.querySelectorAll('.main-section');
        
        sections.forEach(section => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            });
            
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'all 0.6s ease';
            
            observer.observe(section);
        });
    }
}
// إدارة دليل المراكز المحسّن
class CentersDirectoryManager {
    constructor() {
        this.centersData = null;
        this.filteredCenters = [];
        this.currentSector = 'all';
        this.currentGovernorate = '';
        this.searchQuery = '';
    }
    async init() {
        await this.loadCentersData();
        this.setupEventListeners();
        this.populateFilters();
        this.displayCenters();
        this.updateStats();
    }
    async loadCentersData() {
        try {
            const response = await fetch('data/centers.json');
            this.centersData = await response.json();
        } catch (error) {
            console.error('Error loading centers data:', error);
            this.showError();
        }
    }
    setupEventListeners() {
        // تبويبات القطاعات
        document.querySelectorAll('.sector-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleSectorChange(e.target.dataset.sector);
            });
        });
        // فلتر المحافظة
        const governorateFilter = document.getElementById('governorate-filter');
        if (governorateFilter) {
            governorateFilter.addEventListener('change', (e) => {
                this.currentGovernorate = e.target.value;
                this.displayCenters();
            });
        }
        // البحث
        const searchFilter = document.getElementById('search-filter');
        if (searchFilter) {
            searchFilter.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.displayCenters();
            });
        }
    }
    handleSectorChange(sector) {
        this.currentSector = sector;
        
        // تحديث التبويبات النشطة
        document.querySelectorAll('.sector-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-sector="${sector}"]`).classList.add('active');
        
        this.displayCenters();
        this.updateStats();
    }
    populateFilters() {
        const governorateFilter = document.getElementById('governorate-filter');
        if (!governorateFilter || !this.centersData) return;
        const governorates = new Set();
        
        this.centersData.القطاعات.forEach(sector => {
            if (sector.مراكز_الخدمات_المجتمعية) {
                sector.مراكز_الخدمات_المجتمعية.forEach(gov => {
                    governorates.add(gov.المحافظة);
                });
            }
        });
        governorates.forEach(gov => {
            const option = document.createElement('option');
            option.value = gov;
            option.textContent = gov;
            governorateFilter.appendChild(option);
        });
    }
    displayCenters() {
        const container = document.getElementById('centers-container');
        if (!container || !this.centersData) return;
        container.innerHTML = '';
        if (this.currentSector === 'all') {
            this.displayAllSectors(container);
        } else {
            this.displaySectorCenters(container, this.currentSector);
        }
    }
    displayAllSectors(container) {
        this.centersData.القطاعات.forEach(sector => {
            const sectorDiv = document.createElement('div');
            sectorDiv.className = 'sector-section';
            
            const sectorTitle = document.createElement('h3');
            sectorTitle.className = 'sector-title';
            sectorTitle.textContent = sector.اسم_القطاع;
            sectorDiv.appendChild(sectorTitle);
            const centersGrid = document.createElement('div');
            centersGrid.className = 'centers-grid';
            if (sector.مراكز_الخدمات_المجتمعية) {
                this.renderSocialCenters(centersGrid, sector.مراكز_الخدمات_المجتمعية);
            } else if (sector.المؤسسات_الطبية) {
                this.renderMedicalCenters(centersGrid, sector.المؤسسات_الطبية);
            } else if (sector.المؤسسات_التعليمية) {
                this.renderEducationalCenters(centersGrid, sector.المؤسسات_التعليمية);
            }
            sectorDiv.appendChild(centersGrid);
            container.appendChild(sectorDiv);
        });
    }
    displaySectorCenters(container, sectorType) {
        const centersGrid = document.createElement('div');
        centersGrid.className = 'centers-grid';
        const sector = this.centersData.القطاعات.find(s => {
            if (sectorType === 'social') return s.مراكز_الخدمات_المجتمعية;
            if (sectorType === 'medical') return s.المؤسسات_الطبية;
            if (sectorType === 'educational') return s.المؤسسات_التعليمية;
            return false;
        });
        if (sector) {
            if (sectorType === 'social' && sector.مراكز_الخدمات_المجتمعية) {
                this.renderSocialCenters(centersGrid, sector.مراكز_الخدمات_المجتمعية);
            } else if (sectorType === 'medical' && sector.المؤسسات_الطبية) {
                this.renderMedicalCenters(centersGrid, sector.المؤسسات_الطبية);
            } else if (sectorType === 'educational' && sector.المؤسسات_التعليمية) {
                this.renderEducationalCenters(centersGrid, sector.المؤسسات_التعليمية);
            }
        }
        container.appendChild(centersGrid);
    }
    renderSocialCenters(container, governoratesData) {
        governoratesData.forEach(govData => {
            if (this.currentGovernorate && govData.المحافظة !== this.currentGovernorate) return;
            govData.المراكز.forEach(center => {
                if (this.searchQuery && !this.matchesSearch(center.اسم_المركز, center.العنوان_الجغرافي)) return;
                const centerCard = this.createCenterCard({
                    name: center.اسم_المركز,
                    type: 'social',
                    governorate: govData.المحافظة,
                    address: center.العنوان_الجغرافي,
                    phones: center.هاتف_خلوي,
                    bankAccount: center.رقم_الحساب_البنك_الإسلامي,
                    walletId: center.رقم_المحفظة
                });
                container.appendChild(centerCard);
            });
        });
    }
    renderMedicalCenters(container, centersData) {
        centersData.forEach(center => {
            if (this.searchQuery && !this.matchesSearch(center.اسم_المؤسسة, center.المنطقة)) return;
            const centerCard = this.createCenterCard({
                name: center.اسم_المؤسسة,
                type: 'medical',
                governorate: center.المنطقة,
                phones: center.هاتف,
                services: center.الخدمات,
                website: center.الموقع_الإلكتروني,
                email: center.البريد_الإلكتروني
            });
            container.appendChild(centerCard);
        });
    }
    renderEducationalCenters(container, centersData) {
        centersData.forEach(center => {
            if (this.searchQuery && !this.matchesSearch(center.الاسم, center.العنوان)) return;
            const centerCard = this.createCenterCard({
                name: center.الاسم,
                type: 'educational',
                governorate: center.المحافظة,
                address: center.العنوان,
                founded: center.سنة_التأسيس,
                phones: center.معلومات_الاتصال?.هاتف,
                website: center.معلومات_الاتصال?.الموقع_الإلكتروني,
                email: center.معلومات_الاتصال?.البريد_الإلكتروني,
                description: center.الوصف
            });
            container.appendChild(centerCard);
        });
    }
    createCenterCard(centerData) {
        const card = document.createElement('div');
        card.className = 'center-card';
        const typeClass = centerData.type;
        const typeLabel = {
            'social': 'خدمات مجتمعية',
            'medical': 'مؤسسة طبية',
            'educational': 'مؤسسة تعليمية'
        }[centerData.type];
        card.innerHTML = `
            <div class="center-header">
                <div>
                    <span class="center-type ${typeClass}">${typeLabel}</span>
                    <h3>${centerData.name}</h3>
                </div>
            </div>
            <div class="center-info">
                ${centerData.governorate ? `<p><strong>المنطقة:</strong> ${centerData.governorate}</p>` : ''}
                ${centerData.address ? `<p><strong>العنوان:</strong> ${centerData.address}</p>` : ''}
                ${centerData.founded ? `<p><strong>سنة التأسيس:</strong> ${centerData.founded}</p>` : ''}
                ${centerData.phones ? this.renderPhones(centerData.phones) : ''}
                ${centerData.website ? `<p><strong>الموقع:</strong> <a href="${centerData.website}" target="_blank">${centerData.website}</a></p>` : ''}
                ${centerData.email ? `<p><strong>البريد:</strong> <a href="mailto:${centerData.email}">${centerData.email}</a></p>` : ''}
                ${centerData.bankAccount ? `<p><strong>الحساب البنكي:</strong> ${centerData.bankAccount}</p>` : ''}
                ${centerData.walletId ? `<p><strong>رقم المحفظة:</strong> ${centerData.walletId}</p>` : ''}
            </div>
            <div class="center-actions">
                <button class="btn btn-small" onclick="centersManager.showCenterDetails('${centerData.name}')">تفاصيل أكثر</button>
                ${centerData.phones ? `<button class="btn btn-small btn-secondary" onclick="centersManager.callCenter('${Array.isArray(centerData.phones) ? centerData.phones[0] : centerData.phones}')">اتصال</button>` : ''}
            </div>
            ${centerData.services || centerData.description ? `
                <div class="center-details" id="details-${centerData.name.replace(/\s+/g, '-')}">
                    ${centerData.description ? `<p>${centerData.description}</p>` : ''}
                    ${centerData.services ? `
                        <h5>الخدمات المتوفرة:</h5>
                        <ul>
                            ${centerData.services.map(service => `<li>${service}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            ` : ''}
        `;
        return card;
    }
    renderPhones(phones) {
        if (!phones) return '';
        
        const phoneArray = Array.isArray(phones) ? phones : [phones];
        const phoneLinks = phoneArray.map(phone =>
            `<a href="tel:${phone}" class="phone-link">${phone}</a>`
        ).join('');
        
        return `<div class="center-phones">${phoneLinks}</div>`;
    }
    matchesSearch(name, address) {
        const searchText = `${name} ${address || ''}`.toLowerCase();
        return searchText.includes(this.searchQuery);
    }
    showCenterDetails(centerName) {
        const detailsId = `details-${centerName.replace(/\s+/g, '-')}`;
        const details = document.getElementById(detailsId);
        if (details) {
            details.classList.toggle('show');
        }
    }
    callCenter(phone) {
        window.location.href = `tel:${phone}`;
    }
    updateStats() {
        if (!this.centersData) return;
        let socialCount = 0;
        let medicalCount = 0;
        let educationalCount = 0;
        this.centersData.القطاعات.forEach(sector => {
            if (sector.مراكز_الخدمات_المجتمعية) {
                sector.مراكز_الخدمات_المجتمعية.forEach(gov => {
                    socialCount += gov.المراكز.length;
                });
            } else if (sector.المؤسسات_الطبية) {
                medicalCount = sector.المؤسسات_الطبية.length;
            } else if (sector.المؤسسات_التعليمية) {
                educationalCount = sector.المؤسسات_التعليمية.length;
            }
        });
        const totalCount = socialCount + medicalCount + educationalCount;
        this.updateStatElement('social-count', socialCount);
        this.updateStatElement('medical-count', medicalCount);
        this.updateStatElement('educational-count', educationalCount);
        this.updateStatElement('total-count', totalCount);
    }
    updateStatElement(id, count) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = count;
        }
    }
    showError() {
        const container = document.getElementById('centers-container');
        if (container) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>خطأ في تحميل البيانات</h3>
                    <p>نعتذر، حدث خطأ في تحميل بيانات المراكز. يرجى المحاولة مرة أخرى.</p>
                    <button class="btn" onclick="location.reload()">إعادة التحميل</button>
                </div>
            `;
        }
    }
}
// إنشاء مدير دليل المراكز العام
let centersManager;
// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const ui = new EnhancedUIManager();
    ui.init();
    
    // Initialize CentersDirectoryManager only when the legacy container exists and React directory is not mounted.
    // This prevents duplicate renders / DOM conflicts when the React directory is embedded.
    const oldContainer = document.getElementById('centers-container');
    const reactRoot = document.getElementById('directory-root');
    if (oldContainer && !reactRoot) {
        centersManager = new CentersDirectoryManager();
        centersManager.init();
    } else {
        // If React directory is present, do not initialize the legacy centers manager.
        // centersManager remains undefined to avoid manipulation of removed DOM nodes.
    }
    
    // تهيئة الخريطة إذا كانت موجودة
    const mapArea = document.querySelector('.map-area');
    if (mapArea) {
        // بيانات المراكز (يمكن تعديلها هنا)
        const centers = [
            {
                name: "مركز عمان الرئيسي",
                address: "شارع الملك حسين، عمان",
                phone: "06-123-4567",
                hours: "الأحد - الخميس: 8:00 - 16:00",
                position: { top: "45%", right: "60%" },
                gmaps: "https://maps.google.com/maps?q=amman+jordan"
            },
            {
                name: "مركز إربد",
                address: "وسط البلد، إربد",
                phone: "02-345-6789",
                hours: "الأحد - الخميس: 8:00 - 15:00",
                position: { top: "25%", right: "65%" },
                gmaps: "https://maps.google.com/maps?q=irbid+jordan"
            },
            {
                name: "مركز الزرقاء",
                address: "شارع الحكومة، الزرقاء",
                phone: "05-567-8901",
                hours: "الأحد - الخميس: 8:00 - 15:30",
                position: { top: "50%", right: "70%" },
                gmaps: "https://maps.google.com/maps?q=zarqa+jordan"
            },
            {
                name: "مركز الكرك",
                address: "قلعة الكرك، الكرك",
                phone: "03-234-5678",
                hours: "الأحد - الخميس: 8:00 - 14:00",
                position: { top: "70%", right: "55%" },
                gmaps: "https://maps.google.com/maps?q=karak+jordan"
            },
            {
                name: "مركز العقبة",
                address: "كورنيش العقبة، العقبة",
                phone: "03-987-6543",
                hours: "الأحد - الخميس: 8:00 - 15:00",
                position: { top: "85%", right: "45%" },
                gmaps: "https://maps.google.com/maps?q=aqaba+jordan"
            }
        ];
        ui.mapManager.setCenters(centers);
        ui.mapManager.initMap();
    }
});
// دوال مساعدة عامة
const utils = {
    // تنسيق التاريخ
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-JO');
    },
    // التحقق من صحة البريد الإلكتروني
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    // إظهار/إخفاء كلمة المرور
    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        if (input.type === 'password') {
            input.type = 'text';
        } else {
            input.type = 'password';
        }
    },
    // حفظ البيانات محلياً
    saveToStorage(key, data) {
        localStorage.setItem(`jamiyati_${key}`, JSON.stringify(data));
    },
    // جلب البيانات من التخزين المحلي
    getFromStorage(key) {
        const data = localStorage.getItem(`jamiyati_${key}`);
        return data ? JSON.parse(data) : null;
    },
    // مسح البيانات من التخزين المحلي
    clearStorage(key) {
        localStorage.removeItem(`jamiyati_${key}`);
    }
};