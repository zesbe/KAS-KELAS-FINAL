import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Smartphone, 
  CreditCard, 
  Users, 
  BarChart3, 
  Shield, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Menu,
  X,
  MessageCircle,
  Wallet,
  FileText,
  Zap,
  Star,
  Play
} from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "WhatsApp Otomatis",
      description: "Tagihan dan reminder dikirim otomatis via WhatsApp ke semua orang tua",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Pembayaran Digital", 
      description: "Bayar mudah via Bank Transfer, E-Wallet, QRIS dengan satu link",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Laporan Real-time",
      description: "Dashboard dan laporan keuangan yang update otomatis setiap saat",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Aman & Transparan",
      description: "Data aman, audit trail lengkap, dan transparansi penuh untuk orang tua",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const stats = [
    { number: "100%", label: "otomatis", icon: <Zap className="w-5 h-5" /> },
    { number: "10+", label: "metode bayar", icon: <Wallet className="w-5 h-5" /> },
    { number: "24/7", label: "akses portal", icon: <Clock className="w-5 h-5" /> },
    { number: "0", label: "kerja manual", icon: <CheckCircle className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KasKelas</h1>
                <p className="text-xs text-gray-500">Kelas 1A - SD Indonesia</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#fitur" className="text-gray-600 hover:text-blue-600 transition-colors">Fitur</a>
              <a href="#cara-kerja" className="text-gray-600 hover:text-blue-600 transition-colors">Cara Kerja</a>
              <a href="#portal" className="text-gray-600 hover:text-blue-600 transition-colors">Portal Ortu</a>
              <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Masuk Dashboard
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-blue-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4 px-4">
                <a href="#fitur" className="text-gray-600 hover:text-blue-600">Fitur</a>
                <a href="#cara-kerja" className="text-gray-600 hover:text-blue-600">Cara Kerja</a>
                <a href="#portal" className="text-gray-600 hover:text-blue-600">Portal Ortu</a>
                <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-full text-center">
                  Masuk Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 mr-2" />
                Sistem Kas Kelas Terdepan
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Kelola Uang Kas Kelas 
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> 
                  100% Otomatis
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Platform modern untuk bendahara kelas yang mengotomatisasi <strong>tagihan WhatsApp</strong>, 
                <strong> pembayaran digital</strong>, dan <strong>laporan transparan</strong>. 
                Hemat waktu, kurangi ribet!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                  <Play className="w-5 h-5 mr-2" />
                  Mulai Gratis Sekarang
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold hover:border-blue-400 hover:text-blue-600 transition-all duration-300">
                  Lihat Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-2 text-blue-600">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Feature Showcase */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-all duration-500">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-6 text-white mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Dashboard Kas Kelas</h3>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-3xl font-bold">Rp 2.875.000</div>
                  <div className="text-blue-100">Total Saldo Kas</div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Sudah Bayar</span>
                    <span className="text-green-600 font-semibold">22/25 siswa</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Belum Bayar</span>
                    <span className="text-orange-600 font-semibold">3 siswa</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">WhatsApp Terkirim</span>
                    <span className="text-blue-600 font-semibold">25 pesan</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold mt-6 hover:shadow-lg transition-all">
                  Kirim Reminder WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
              Fitur Lengkap untuk Bendahara Modern
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola kas kelas dengan efisien, transparan, dan professional
            </p>
          </div>

          {/* Rotating Feature Display */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 lg:p-12 mb-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${features[currentFeature].color} text-white mb-6`}>
                  {features[currentFeature].icon}
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  {features[currentFeature].title}
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  {features[currentFeature].description}
                </p>
                <div className="flex space-x-2">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentFeature ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                {currentFeature === 0 && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-green-800">WhatsApp Terkirim</span>
                      </div>
                      <p className="text-gray-600 text-sm">📱 Tagihan Kas Bulan Agustus telah dikirim ke 25 orang tua</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-blue-800">Reminder Otomatis</span>
                      </div>
                      <p className="text-gray-600 text-sm">⏰ Reminder H-3 akan dikirim otomatis besok</p>
                    </div>
                  </div>
                )}
                {currentFeature === 1 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-2">Multiple Payment Options</div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-blue-50 p-3 rounded-lg">🏦 Bank Transfer</div>
                        <div className="bg-green-50 p-3 rounded-lg">💳 GoPay, OVO</div>
                        <div className="bg-purple-50 p-3 rounded-lg">📱 QRIS</div>
                      </div>
                    </div>
                  </div>
                )}
                {currentFeature === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-xl font-bold text-green-600">Rp 2.8M</div>
                        <div className="text-sm text-gray-600">Total Pemasukan</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg text-center">
                        <div className="text-xl font-bold text-red-600">Rp 450K</div>
                        <div className="text-sm text-gray-600">Total Pengeluaran</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">Rp 2.35M</div>
                      <div className="text-sm text-gray-600">Saldo Akhir</div>
                    </div>
                  </div>
                )}
                {currentFeature === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-600">Keamanan Data</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-600">Audit Trail</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-600">Backup Otomatis</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-6 h-6" />,
                title: "Manajemen Siswa",
                description: "Database siswa lengkap dengan kontak orang tua dan history pembayaran"
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: "Laporan Otomatis",
                description: "Generate laporan bulanan dan tahunan dengan sekali klik"
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Reminder Cerdas",
                description: "Sistem reminder bertingkat: H-3, H-0, H+3, H+7 secara otomatis"
              },
              {
                icon: <Smartphone className="w-6 h-6" />,
                title: "Mobile Friendly",
                description: "Akses dari smartphone, tablet, atau komputer dengan tampilan optimal"
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Data Aman",
                description: "Enkripsi tingkat bank dan backup otomatis untuk keamanan data maksimal"
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Real-time Update",
                description: "Dashboard update langsung saat ada pembayaran masuk atau pengeluaran baru"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="cara-kerja" className="py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
              Cara Kerja Super Mudah
            </h2>
            <p className="text-xl text-gray-600">
              Hanya 3 langkah untuk sistem kas kelas yang 100% otomatis
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Setup Data Siswa",
                description: "Input data 25 siswa beserta nomor WhatsApp orang tua. Sekali setup, selamanya otomatis!",
                icon: <Users className="w-8 h-8" />,
                color: "from-blue-500 to-blue-600"
              },
              {
                step: "02", 
                title: "Sistem Berjalan Otomatis",
                description: "Setiap tanggal 1, sistem auto kirim tagihan WhatsApp dengan link pembayaran ke semua orang tua",
                icon: <MessageCircle className="w-8 h-8" />,
                color: "from-green-500 to-green-600"
              },
              {
                step: "03",
                title: "Monitor & Laporan",
                description: "Dashboard real-time menampilkan status pembayaran, saldo kas, dan laporan yang siap dibagikan",
                icon: <BarChart3 className="w-8 h-8" />,
                color: "from-purple-500 to-purple-600"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${step.color} text-white mb-6`}>
                    {step.icon}
                  </div>
                  
                  <div className="text-sm font-bold text-gray-400 mb-2">LANGKAH {step.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                
                {index < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Orang Tua */}
      <section id="portal" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Portal Khusus Orang Tua
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Orang tua dapat mengakses portal khusus untuk melihat status pembayaran anak, 
                history transaksi, dan laporan keuangan kelas secara transparan.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  "✅ Status pembayaran anak real-time",
                  "✅ History pembayaran lengkap", 
                  "✅ Laporan keuangan kelas transparan",
                  "✅ Notifikasi WhatsApp otomatis",
                  "✅ Akses 24/7 dari smartphone"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="text-green-600 font-semibold">{feature}</div>
                  </div>
                ))}
              </div>

              <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center">
                Coba Portal Orang Tua
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl p-8">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Portal Orang Tua</h3>
                  <div className="text-sm text-green-600 font-medium">● Online</div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="text-sm text-blue-600 mb-1">Anak Anda</div>
                  <div className="text-xl font-bold text-gray-900">Ahmad Rizki Pratama</div>
                  <div className="text-sm text-gray-600">Nomor Absen: 1</div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-600">Status Agustus 2024</span>
                    <span className="text-green-600 font-semibold">✅ Lunas</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-gray-600">Status September 2024</span>
                    <span className="text-orange-600 font-semibold">⏳ Belum Bayar</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Dibayar</span>
                    <span className="text-gray-900 font-semibold">Rp 175.000</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold mt-6">
                  Bayar Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Siap Revolusi Cara Kelola Kas Kelas?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Bergabung dengan ratusan bendahara kelas yang sudah merasakan kemudahan sistem otomatis 100%
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Mulai Gratis Hari Ini
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
              Hubungi Kami
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">KasKelas</h3>
                  <p className="text-sm text-gray-400">Kelas 1A - SD Indonesia</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Platform manajemen kas kelas yang 100% otomatis, aman, dan transparan.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Fitur</h4>
              <ul className="space-y-2 text-gray-400">
                <li>WhatsApp Otomatis</li>
                <li>Pembayaran Digital</li>
                <li>Laporan Real-time</li>
                <li>Portal Orang Tua</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Dukungan</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Panduan Lengkap</li>
                <li>Video Tutorial</li>
                <li>Chat Support</li>
                <li>FAQ</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📱 0812-3456-7890</li>
                <li>✉️ support@berbagiakun.com</li>
                <li>🌐 berbagiakun.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 KasKelas - Sistem Manajemen Kas Kelas Modern. Dikembangkan dengan ❤️ untuk pendidikan Indonesia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
