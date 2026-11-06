"use client"

import { useSiteConfig } from "@/hooks/use-site-config"
import {
  Calendar,
  MapPin,
  Clock,
  Heart,
  Church,
  Utensils,
  Phone,
  Mail,
  Users,
  Image as ImageIcon,
} from "lucide-react"

export function WeddingDetails() {
  const siteConfig = useSiteConfig()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#25253D]">Wedding Details</h2>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-[#333C63] to-[#25253D] rounded-2xl p-8 shadow-lg text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold">
              {siteConfig.couple.groomNickname} & {siteConfig.couple.brideNickname}
            </h1>
            <p className="text-white/90 text-lg mt-1">{siteConfig.wedding.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/90">
          <Calendar className="h-5 w-5" />
          <span className="text-lg">{siteConfig.wedding.date}</span>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Couple Information */}
        <div className="bg-white rounded-xl shadow-sm border border-[#858CA4] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#FFF0E7] rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-[#333C63]" />
            </div>
            <h3 className="text-xl font-bold text-[#25253D]">The Couple</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#545B76] block mb-1">Groom</label>
              <p className="text-lg font-semibold text-[#25253D]">
                {siteConfig.couple.groom}
              </p>
              <p className="text-sm text-[#545B76]">&quot;{siteConfig.couple.groomNickname}&quot;</p>
            </div>
            <div className="border-t border-[#858CA4] pt-4">
              <label className="text-sm font-medium text-[#545B76] block mb-1">Bride</label>
              <p className="text-lg font-semibold text-[#25253D]">
                {siteConfig.couple.bride}
              </p>
              <p className="text-sm text-[#545B76]">&quot;{siteConfig.couple.brideNickname}&quot;</p>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-white rounded-xl shadow-sm border border-[#858CA4] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#FFF0E7] rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-[#333C63]" />
            </div>
            <h3 className="text-xl font-bold text-[#25253D]">Event Details</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-[#545B76] mt-0.5 flex-shrink-0" />
              <div>
                <label className="text-sm font-medium text-[#545B76] block">Date</label>
                <p className="text-[#25253D] font-medium">{siteConfig.wedding.date}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-[#545B76] mt-0.5 flex-shrink-0" />
              <div>
                <label className="text-sm font-medium text-[#545B76] block">Time</label>
                <p className="text-[#25253D] font-medium">{siteConfig.ceremony.time}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ceremony & Reception */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ceremony */}
        <div className="bg-white rounded-xl shadow-sm border border-[#858CA4] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Church className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-[#25253D]">Ceremony</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#545B76] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[#25253D] font-medium">{siteConfig.ceremony.location}</p>
                <p className="text-sm text-[#545B76] mt-1">{siteConfig.ceremony.venue}</p>
              </div>
            </div>
            {siteConfig.ceremony.map && (
              <a
                href={siteConfig.ceremony.map}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#333C63] hover:text-[#25253D] font-medium transition-colors"
              >
                <MapPin className="h-4 w-4" />
                View on Google Maps
              </a>
            )}
          </div>
        </div>

        {/* Reception */}
        <div className="bg-white rounded-xl shadow-sm border border-[#858CA4] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Utensils className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-[#25253D]">Reception</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#545B76] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[#25253D] font-medium">{siteConfig.reception.location}</p>
                <p className="text-sm text-[#545B76] mt-1">{siteConfig.reception.venue}</p>
              </div>
            </div>
            {siteConfig.reception.map && (
              <a
                href={siteConfig.reception.map}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#333C63] hover:text-[#25253D] font-medium transition-colors"
              >
                <MapPin className="h-4 w-4" />
                View on Google Maps
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border border-[#858CA4] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Phone className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-[#25253D]">Contact Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {siteConfig.contact.groomPhone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-[#545B76] mt-0.5 flex-shrink-0" />
              <div>
                <label className="text-sm font-medium text-[#545B76] block">
                  {siteConfig.couple.groomNickname}&apos;s Phone
                </label>
                <a
                  href={`tel:${siteConfig.contact.groomPhone}`}
                  className="text-[#333C63] hover:text-[#25253D] font-medium transition-colors"
                >
                  {siteConfig.contact.groomPhone}
                </a>
              </div>
            </div>
          )}
          {siteConfig.contact.bridePhone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-[#545B76] mt-0.5 flex-shrink-0" />
              <div>
                <label className="text-sm font-medium text-[#545B76] block">
                  {siteConfig.couple.brideNickname}&apos;s Phone
                </label>
                <a
                  href={`tel:${siteConfig.contact.bridePhone}`}
                  className="text-[#333C63] hover:text-[#25253D] font-medium transition-colors"
                >
                  {siteConfig.contact.bridePhone}
                </a>
              </div>
            </div>
          )}
          {siteConfig.contact.email && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-[#545B76] mt-0.5 flex-shrink-0" />
              <div>
                <label className="text-sm font-medium text-[#545B76] block">Email</label>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="text-[#333C63] hover:text-[#25253D] font-medium transition-colors break-all"
                >
                  {siteConfig.contact.email}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gradient-to-br from-[#FFF0E7] to-[#FFFAF7] rounded-xl border border-[#858CA4] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#333C63] to-[#25253D] rounded-lg flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-[#25253D]">Quick Info</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm">
            <label className="text-sm font-medium text-[#545B76] block mb-1">Theme</label>
            <p className="text-[#25253D] font-semibold">{siteConfig.wedding.theme}</p>
          </div>
          <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm">
            <label className="text-sm font-medium text-[#545B76] block mb-1">Dress Code</label>
            <p className="text-[#25253D] font-semibold">{siteConfig.dressCode.theme}</p>
          </div>
          <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm">
            <label className="text-sm font-medium text-[#545B76] block mb-1">Hashtag</label>
            <p className="text-[#333C63] font-semibold">{siteConfig.snapShare.hashtag[0]}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
