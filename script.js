let discountCodes = {}; // Untuk menyimpan kode diskon yang valid

// Di bagian atas file, tambahkan konstanta untuk mengontrol fitur diskon
const DISCOUNT_FEATURE_ENABLED = false; // Ubah menjadi true untuk mengaktifkan kembali

function openChatAutomatically() {
    // Cek apakah elemen chat ada di halaman ini
    const chatContainer = document.querySelector('.live-chat-container');
    const chatToggle = document.querySelector('.chat-toggle');
    
    if (!chatContainer || !chatToggle) return; // Jika tidak ada elemen chat, hentikan fungsi
    
    setTimeout(() => {
        chatContainer.style.display = 'block';
        chatToggle.style.display = 'none';
        
        // Tambahkan animasi fade in
        chatContainer.style.animation = 'fadeIn 0.5s ease-out';
        chatContainer.classList.add('visible');
    }, 5000);
}

function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const filter = searchInput.value.toLowerCase();
    const products = document.getElementsByClassName('product-card');

    for (let i = 0; i < products.length; i++) {
        const productName = products[i].getElementsByTagName('h3')[0].innerText;
        if (productName.toLowerCase().indexOf(filter) > -1) {
            products[i].style.display = "";
        } else {
            products[i].style.display = "none";
        }
    }
}

function filterProducts(category) {
    const products = document.getElementsByClassName('product-card');
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });

    for (let product of products) {
        if (category === 'all') {
            product.style.display = '';
            continue;
        }

        const productName = product.querySelector('h3').textContent.toLowerCase();
        let shouldShow = false;

        switch (category) {
            case 'mod':
                shouldShow = [
                    'quantv (basic)', 'quantv (pro)', 'quantv (premium)',
                    'nve', 'rtgi', 'GTA V UPSCALER', '8 level', 'road', 
                    'street light', 'vegetation', 'video export', 
                    'weapon sound', 'borealis'
                ].some(term => productName.includes(term.toLowerCase()));
                break;
            
            case 'preset':
                shouldShow = [
                    'np koil', 'xvisual', 'gamesource', 'inter', 
                    'monster killer', 'gold_tier'
                ].some(term => productName.includes(term.toLowerCase()));
                break;
            
            case 'fps':
                shouldShow = productName.includes('citizen tier');
                break;
        }

        product.style.display = shouldShow ? '' : 'none';
    }
}

// Fungsi untuk mengkonversi harga ke jumlah Lockpick
function convertToLockpicks(price) {
    // Menghapus "Rp " dan "." dari string harga, lalu konversi ke number
    const numericPrice = parseInt(price.replace(/Rp |\./g, ''));
    // 1 Lockpick = Rp 1.000
    return Math.round(numericPrice / 1000);
}

// Tambahkan daftar kode diskon dengan tingkat kesulitan
const discountTiers = {
    easy: {
        chance: 0.50, // 50% kesempatan
        discounts: [5, 10], // diskon 5-10%
        prefix: 'EASY'
    },
    medium: {
        chance: 0.30, // 30% kesempatan
        discounts: [15, 20], // diskon 15-20%
        prefix: 'MED'
    },
    hard: {
        chance: 0.15, // 15% kesempatan
        discounts: [25], // diskon 25%
        prefix: 'HARD'
    },
    legendary: {
        chance: 0.05, // 5% kesempatan
        discounts: [30], // diskon 30%
        prefix: 'LEGEND'
    }
};

// Fungsi untuk menghasilkan kode diskon acak
function generateDiscountCode() {
    if (!DISCOUNT_FEATURE_ENABLED) return null;
    // Generate random number untuk menentukan tier
    const rand = Math.random();
    let selectedTier;
    let accumulatedChance = 0;

    for (const [tier, data] of Object.entries(discountTiers)) {
        accumulatedChance += data.chance;
        if (rand <= accumulatedChance) {
            selectedTier = { tier, ...data };
            break;
        }
    }

    // Generate kode acak
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const randomDiscount = selectedTier.discounts[Math.floor(Math.random() * selectedTier.discounts.length)];
    const code = `${selectedTier.prefix}${randomNum}`;

    return {
        code: code,
        discount: randomDiscount,
        tier: selectedTier.tier
    };
}

// Fungsi untuk menampilkan modal generate kode diskon
function showDiscountModal(originalPrice, alertBox) {
    if (!DISCOUNT_FEATURE_ENABLED) return;
    const modal = document.createElement('div');
    modal.className = 'discount-modal';
    modal.innerHTML = `
        <div class="discount-content">
            <h2>🎉 SELAMAT OTW TAHUN BARU 2025 🎮</h2>
            <div class="discount-game">
                <p class="game-instruction">Klik tombol di bawah untuk mencoba mendapatkan kode diskon!</p>
                <div class="chance-info">
                    <div class="chance-item legendary">
                        <span class="tier">LEGENDARY</span>
                        <span class="discount">30% OFF</span>
                        <span class="chance">5% Chance</span>
                    </div>
                    <div class="chance-item hard">
                        <span class="tier">HARD</span>
                        <span class="discount">25% OFF</span>
                        <span class="chance">15% Chance</span>
                    </div>
                    <div class="chance-item medium">
                        <span class="tier">MEDIUM</span>
                        <span class="discount">15-20% OFF</span>
                        <span class="chance">30% Chance</span>
                    </div>
                    <div class="chance-item easy">
                        <span class="tier">EASY</span>
                        <span class="discount">5-10% OFF</span>
                        <span class="chance">50% Chance</span>
                    </div>
                </div>
                <button class="generate-btn">GENERATE KODE DISKON</button>
                <div class="result-container" style="display: none;">
                    <div class="result-animation"></div>
                    <div class="result-code"></div>
                </div>
            </div>
            <p class="discount-note">*Kode diskon hanya bisa digunakan satu kali</p>
            <button class="close-discount-btn">Tutup</button>
        </div>
    `;
    document.body.appendChild(modal);

    const generateBtn = modal.querySelector('.generate-btn');
    const resultContainer = modal.querySelector('.result-container');
    const resultCode = modal.querySelector('.result-code');

    generateBtn.addEventListener('click', function() {
        this.disabled = true;
        resultContainer.style.display = 'block';
        resultContainer.querySelector('.result-animation').innerHTML = `
            <div class="loading-spinner"></div>
            <p>Generating kode...</p>
        `;

        // Simulasi loading
        setTimeout(() => {
            const result = generateDiscountCode();
            const tierColors = {
                legendary: '#ff00ff',
                hard: '#ff0000',
                medium: '#00ffff',
                easy: '#00ff00'
            };

            resultContainer.querySelector('.result-animation').remove();
            resultCode.innerHTML = `
                <div class="discount-result ${result.tier}">
                    <h3 style="color: ${tierColors[result.tier]}">
                        ${result.tier.toUpperCase()} TIER!
                    </h3>
                    <div class="code-display">
                        <span>${result.code}</span>
                        <span class="discount-value">${result.discount}% OFF</span>
                    </div>
                    <button class="use-code-btn">Gunakan Kode</button>
                </div>
            `;

            // Event listener untuk tombol "Gunakan Kode"
            resultCode.querySelector('.use-code-btn').addEventListener('click', function() {
                const discountInput = document.getElementById('discountCode');
                if (discountInput) {
                    discountInput.value = result.code;
                    // Tambahkan kode ke daftar kode yang valid
                    discountCodes[result.code] = result.discount;
                    
                    // Langsung terapkan diskon
                    const discountPercentage = result.discount;
                    const discount = (originalPrice * discountPercentage) / 100;
                    const discountedPrice = originalPrice - discount;
                    const newLockpicks = Math.round(discountedPrice / 1000);
                    
                    // Update tampilan harga dan lockpick
                    alertBox.querySelector('.lockpick-amount').textContent = `${newLockpicks} Lockpick`;
                    alertBox.querySelector('.price-amount').textContent = `Rp ${discountedPrice.toLocaleString('id-ID')}`;
                    
                    // Tampilkan notifikasi diskon berhasil
                    const notification = document.createElement('div');
                    notification.className = 'discount-notification success';
                    notification.textContent = `Diskon ${discountPercentage}% berhasil diterapkan!`;
                    notification.style.backgroundColor = 'rgba(0, 255, 0, 0.9)';
                    alertBox.appendChild(notification);
                    
                    setTimeout(() => {
                        notification.remove();
                    }, 3000);

                    // Tutup modal diskon
                    modal.remove();
                }
            });
        }, 2000);
    });

    // Event listener untuk tombol tutup
    modal.querySelector('.close-discount-btn').addEventListener('click', () => {
        modal.remove();
    });
}

// Fungsi untuk menghitung harga setelah diskon
function calculateDiscountedPrice(originalPrice, discountCode) {
    if (!DISCOUNT_FEATURE_ENABLED) return originalPrice;
    if (discountCodes[discountCode]) {
        const discountPercentage = discountCodes[discountCode];
        const discount = (originalPrice * discountPercentage) / 100;
        return originalPrice - discount;
    }
    return originalPrice;
}

// Fungsi untuk menampilkan custom alert
function showCyberAlert(title, productName, price) {
    const originalPrice = parseInt(price.replace(/Rp |\./g, '')); // Simpan harga asli
    let currentPrice = originalPrice; // Untuk tracking harga setelah diskon
    const lockpicks = convertToLockpicks(price);
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    
    const alertBox = document.createElement('div');
    alertBox.className = 'cyber-alert';
    alertBox.innerHTML = `
        <div class="cyber-alert-content">
            <h2>${title}</h2>
            <div class="product-request">
                <p><span class="lockpick-amount">${lockpicks} Lockpick</span> untuk mendapatkan <span class="product-name">${productName}</span></p>
                <p class="price-display">Harga: <span class="price-amount">Rp ${originalPrice.toLocaleString('id-ID')}</span></p>
            </div>
            ${DISCOUNT_FEATURE_ENABLED ? `
            <div class="discount-section">
                <input type="text" id="discountCode" placeholder="Masukkan kode diskon" class="discount-input" disabled>
                <button class="show-discounts-btn">Dapatkan Kode Diskon Disini</button>
            </div>
            ` : ''}
            <div class="instruction-steps">
                <p class="step">1. Klik "Lanjut Ke Pembayaran"</p>
                <p class="step">2. Sesuaikan jumlah lockpick (sesuai yang tertera)</p>
                <p class="step">3. Selesaikan Payment</p>
                <p class="step">4. Kembali ke halaman ini</p>
            </div>
            <p class="thank-note">Terimakasih atas kontribusi anda kepada komunitas.</p>
            <button class="cyber-alert-btn">Lanjutkan ke Pembayaran</button>
            <p class="cancel-hint">Klik di mana saja untuk membatalkan</p>
        </div>
    `;

    // Tambahkan CSS baru untuk styling
    const style = document.createElement('style');
    style.textContent = `
        .product-request {
            background: rgba(255, 0, 255, 0.1);
            padding: 1rem;
            margin: 1rem 0;
            border-left: 3px solid #ff00ff;
            font-size: 1.1rem;
        }

        .lockpick-amount {
            color: #00ffff;
            font-weight: bold;
            text-shadow: 0 0 5px #00ffff;
        }

        .product-name {
            color: #ff00ff;
            font-weight: bold;
            text-shadow: 0 0 5px #ff00ff;
        }

        .instruction-steps {
            text-align: left;
            margin: 1.5rem 0;
            padding: 1rem;
            background: rgba(0, 255, 255, 0.1);
            border-left: 3px solid #00ffff;
        }

        .step {
            color: #fff !important;
            margin: 0.8rem 0 !important;
            text-shadow: 0 0 5px #00ffff30 !important;
            font-size: 0.95rem !important;
        }

        .thank-note {
            color: #ff00ff !important;
            margin: 1.5rem 0 !important;
            font-style: italic;
            text-shadow: 0 0 5px #ff00ff50 !important;
        }

        .cyber-alert {
            max-width: 600px;
            width: 90%;
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(overlay);
    document.body.appendChild(alertBox);

    overlay.style.display = 'block';
    alertBox.style.display = 'block';
    alertBox.style.animation = 'slideIn 0.3s ease-out';

    // Modifikasi event listener untuk tombol diskon
    if (DISCOUNT_FEATURE_ENABLED) {
        alertBox.querySelector('.show-discounts-btn').addEventListener('click', () => {
            showDiscountModal(originalPrice, alertBox);
        });
    }

    // Fungsi untuk menutup alert
    const closeAlert = () => {
        overlay.style.animation = 'fadeOut 0.3s';
        alertBox.style.animation = 'slideOut 0.3s';
        setTimeout(() => {
            overlay.remove();
            alertBox.remove();
        }, 300);
    };

    // Event listeners
    const btn = alertBox.querySelector('.cyber-alert-btn');
    btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        
        // Ambil jumlah lockpick terbaru dari tampilan
        const currentLockpicks = parseInt(alertBox.querySelector('.lockpick-amount').textContent);
        
        // Kirim data ke webhook Discord
        const webhookData = {
            embeds: [{
                title: "💰 LAPORAN DONASI LOCKPICK",
                color: 0x00ff00,
                fields: [
                    {
                        name: "```━━━━━━━━━━━━━━━━━━━━━━```",
                        value: "\u200B",
                        inline: false
                    },
                    {
                        name: "🎮 Produk",
                        value: "```" + productName + "```",
                        inline: false
                    },
                    {
                        name: "🔒 Jumlah Lockpick",
                        value: "```" + currentLockpicks + " Lockpick```",
                        inline: false
                    },
                    {
                        name: "💵 Total Harga",
                        value: "```Rp " + currentPrice.toLocaleString('id-ID') + "```",
                        inline: false
                    },
                    {
                        name: "```━━━━━━━━━━━━━━━━━━━━━━```",
                        value: "\u200B",
                        inline: false
                    }
                ],
                footer: {
                    text: `Waktu: ${new Date().toLocaleString('id-ID')}`
                }
            }]
        };

        try {
            await fetch('https://discord.com/api/webhooks/1310946227722125403/ABmpavtgM84bAYgMkWwk1zwkHaBQqMYQH2DKLvbrEOTYU8iv24dYsbJbF-8Kg4QCXiQv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookData)
            });
        } catch (error) {
            console.error('Error sending webhook:', error);
        }

        // Buka link pembayaran di tab baru
        window.open('https://trakteer.id/xvisual/link', '_blank');
        
        // Ubah teks tombol dan tambahkan instruksi tambahan
        btn.textContent = 'Sudah Melakukan Pembayaran';
        btn.style.background = 'linear-gradient(45deg, #00ff00, #00ffff)';
        
        // Tambahkan instruksi setelah pembayaran
        const paymentInstructions = document.createElement('div');
        paymentInstructions.className = 'payment-instructions';
        paymentInstructions.innerHTML = `
            <div class="payment-steps">
                <h3>Terakhir:</h3>
                <ol>
                    <li>Klik tombol "Upload Bukti Pembayaran"</li>
                    <li>File akan dikirimkan secara otomatis dalam beberapa detik (jika tidak ada kendala)</li>
                </ol>
                <a href="payment_selesai.html" class="upload-payment-btn">
                    <i class="fas fa-upload"></i> Upload Bukti Pembayaran
                </a>
                <button class="close-alert-btn">
                    <i class="fas fa-times"></i> Tutup
                </button>
            </div>
        `;
        
        // Tambahkan instruksi setelah tombol
        btn.parentNode.insertBefore(paymentInstructions, btn.nextSibling);
        // Sembunyikan tombol pembayaran
        btn.style.display = 'none';
        
        // Event listener untuk tombol tutup
        paymentInstructions.querySelector('.close-alert-btn').addEventListener('click', () => {
            closeAlert();
        });
    });

    // Hanya tutup saat mengklik overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeAlert();
        }
    });

    // Mencegah popup tertutup saat mengklik konten
    alertBox.addEventListener('click', (e) => e.stopPropagation());
}

// Tambahkan styling untuk notifikasi
const style = document.createElement('style');
style.textContent = `
    .mode-notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out;
    }

    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, 20px); }
        15% { opacity: 1; transform: translate(-50%, 0); }
        85% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -20px); }
    }
`;
document.head.appendChild(style);

// Fungsi untuk handle pembelian
function handlePurchase(e) {
    e.stopPropagation(); // Mencegah event bubbling yang bisa memicu flip

    const card = e.target.closest('.product-card');
    const productInfo = card.querySelector('.product-info');
    const productName = productInfo.querySelector('h3').textContent;
    const price = productInfo.querySelector('.price').textContent;
    
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
        this.style.transform = 'scale(1)';
        showCyberAlert('INSTRUKSI PEMBAYARAN', productName, price);
    }, 100);
}

// Create particles
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.opacity = Math.random();
        particlesContainer.appendChild(particle);
    }
}

// Add background elements
function createBackgroundElements() {
    const bgElements = document.createElement('div');
    bgElements.className = 'bg-elements';
    document.body.appendChild(bgElements);
}

// Gunakan satu event listener DOMContentLoaded utama
document.addEventListener('DOMContentLoaded', () => {
    // Cek apakah elemen-elemen yang diperlukan ada
    const buyButtons = document.querySelectorAll('.buy-btn');
    const specialCards = document.querySelectorAll('.product-card[data-special="true"]');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const showMoreBtn = document.querySelector('.show-more-testimonials');
    const testimonialsContainer = document.querySelector('.testimonials-container');
    const testimonialsOverlay = document.querySelector('.testimonials-overlay');
    const videoSearchInput = document.getElementById('videoSearchInput');

    // Event listener untuk tombol beli
    if (buyButtons.length > 0) {
        buyButtons.forEach(button => {
            button.addEventListener('click', handlePurchase);
        });
    }

    // Event listener untuk kartu spesial
    if (specialCards.length > 0) {
        specialCards.forEach(card => {
            const buyBtn = card.querySelector('.buy-btn');
            if (buyBtn) {
                buyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }

            card.addEventListener('click', (e) => {
                if (!e.target.closest('.buy-btn')) {
                    const cardInner = card.querySelector('.card-inner');
                    if (cardInner) {
                        cardInner.style.transform = 
                            cardInner.style.transform === 'rotateY(180deg)' 
                                ? 'rotateY(0deg)' 
                                : 'rotateY(180deg)';
                    }
                }
            });
        });
    }

    // Event listener untuk tab kategori
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterProducts(button.dataset.category);
            });
        });
    }

    // Event listener untuk tombol show more testimonials
    if (showMoreBtn && testimonialsContainer && testimonialsOverlay) {
        showMoreBtn.addEventListener('click', () => {
            const currentPosition = window.scrollY;
            testimonialsContainer.classList.add('expanded');
            testimonialsOverlay.classList.add('expanded');
            showMoreBtn.classList.add('hidden');
            
            setTimeout(() => {
                window.scrollTo({
                    top: currentPosition,
                    behavior: 'instant'
                });
            }, 50);
        });
    }

    // Event listener untuk pencarian video
    if (videoSearchInput) {
        videoSearchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            const products = document.querySelectorAll('.product-review');
            let found = false;
            
            // Daftar kata kunci dan sinonimnya
            const keywords = {
                'nve': ['nve', 'natural vision evolved'],
                'quantv': ['quantv', 'quant v', 'quant'],
                'rtgi': ['rtgi', 'ray tracing'],
                'xvisual': ['xvisual', 'x visual'],
            };
            
            products.forEach(product => {
                const title = product.querySelector('.product-title').textContent.toLowerCase();
                let shouldShow = false;
                
                if (title.includes(searchTerm)) {
                    shouldShow = true;
                } else {
                    for (const [key, synonyms] of Object.entries(keywords)) {
                        if (synonyms.some(synonym => {
                            return synonym.includes(searchTerm) || searchTerm.includes(synonym);
                        })) {
                            if (title.includes(key) || synonyms.some(s => title.includes(s))) {
                                shouldShow = true;
                                break;
                            }
                        }
                    }
                }
                
                product.style.display = shouldShow ? 'block' : 'none';
                if (shouldShow) found = true;
            });

            // Tampilkan pesan jika tidak ada hasil
            const noResultsMsg = document.getElementById('noResults');
            if (!found && searchTerm !== '') {
                if (!noResultsMsg) {
                    const msg = document.createElement('div');
                    msg.id = 'noResults';
                    msg.className = 'no-results';
                    msg.style.display = 'block';
                    msg.innerHTML = `
                        <i class="fas fa-search" style="font-size: 2em; color: #ff00ff; margin-bottom: 15px;"></i>
                        <p>Tidak ada video yang ditemukan untuk pencarian "${searchTerm}"</p>
                    `;
                    document.querySelector('.product-reviews').appendChild(msg);
                }
            } else if (noResultsMsg) {
                noResultsMsg.remove();
            }
        });
    }

    // Inisialisasi background effects
    createBackgroundElements();
    createParticles();

    // Buka chat otomatis
    openChatAutomatically();
});
  