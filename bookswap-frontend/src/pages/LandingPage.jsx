import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Zap, Shield, Trash2, Gift, ArrowRight, Star } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useAuthStore } from '../store/authStore';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();

  const features = [
    {
      icon: BookOpen,
      title: 'Exchange Books',
      description: 'Swap books with other readers in your community.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Connect with Readers',
      description: 'Join a community of book lovers and make new friends.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Fast & Easy',
      description: 'Simple process to list and manage your books.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Safe transactions with verified community members.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Trash2,
      title: 'Borrow & Rent',
      description: 'Access books without committing to purchase.',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Gift,
      title: 'Donate Books',
      description: 'Give books a second life and help the community.',
      gradient: 'from-rose-500 to-pink-500',
    },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="mb-4 inline-block">
              <span className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full text-sm text-blue-300">
                Welcome to the future of reading
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Share Books, <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Build Community
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Exchange, borrow, rent, and donate books with readers in your community. 
              Join BookSwap today and discover a world of endless stories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center justify-center gap-2"
                onClick={() => navigate(isLoggedIn() ? '/books' : '/signup')}
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Button>
              {isLoggedIn() && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-500 text-gray-300 hover:bg-gray-800/50"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-6">
              ✓ Free to join • ✓ No shipping costs • ✓ 5000+ active users
            </p>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 h-40 flex items-center justify-center border border-gray-700 hover:border-blue-500/50 transition-colors"
                  >
                    <BookOpen className="w-16 h-16 text-blue-400/50" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">5000+</div>
              <p className="text-blue-100">Active Users</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">25000+</div>
              <p className="text-blue-100">Books Listed</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">15000+</div>
              <p className="text-blue-100">Exchanges</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">50+</div>
              <p className="text-blue-100">Cities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Choose BookSwap?
          </h2>
          <p className="text-xl text-gray-300">
            Discover the benefits of our community-driven platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                hover
                className="bg-gray-800/50 border border-gray-700 hover:border-blue-500/50"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`bg-gradient-to-br ${feature.gradient} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-400">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-800/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: 1, title: 'Sign Up', desc: 'Create your free account', icon: '📝' },
              { num: 2, title: 'List Books', desc: 'Add books you want to share', icon: '📚' },
              { num: 3, title: 'Connect', desc: 'Find readers in your area', icon: '🤝' },
              { num: 4, title: 'Exchange', desc: 'Swap, borrow, or rent books', icon: '✨' },
            ].map((step) => (
              <div key={step.num} className="relative">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-semibold text-white text-center mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-center text-sm">
                    {step.desc}
                  </p>
                </div>
                {step.num < 4 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[40%] h-0.5 bg-gradient-to-r from-blue-600 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            What Our Users Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Sarah Johnson',
              role: 'Book Enthusiast',
              text: 'BookSwap helped me discover new books without breaking the bank!',
              rating: 5,
            },
            {
              name: 'Michael Chen',
              role: 'Reader',
              text: 'Amazing community of people who love books as much as I do.',
              rating: 5,
            },
            {
              name: 'Emma Williams',
              role: 'Student',
              text: 'Perfect for students like me. Affordable book sharing made easy.',
              rating: 5,
            },
          ].map((testimonial, index) => (
            <Card key={index} className="bg-gray-800/50 border border-gray-700">
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">"{testimonial.text}"</p>
              <div>
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-gray-400">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section - FIXED: Removed browse button and fixed button colors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Sharing?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join our community of book lovers today and discover endless reading possibilities.
          </p>
          <Button
            size="lg"
            className="bg-white text-purple-700 hover:bg-gray-100 font-semibold shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate('/signup')}
          >
            Sign Up Now <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};