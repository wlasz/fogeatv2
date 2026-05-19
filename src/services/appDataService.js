import { checkinService } from './checkinService.js'
import { menuPhotoService } from './menuPhotoService.js'
import { profileService } from './profileService.js'
import { venueCatalogService } from './venueCatalogService.js'
import { venueDataService } from './venueDataService.js'
import { wishlistService } from './wishlistService.js'

export const appDataService = {
  async loadUserAppData(userId) {
    const [
      profile,
      checkins,
      wishVenues,
      venueNotes,
      customLabels,
      venueLabels,
      customVenues,
      venueRatings,
      menuPhotos,
      catalogVenues,
    ] = await Promise.all([
      profileService.getProfile(userId),
      checkinService.listUserCheckins(userId),
      wishlistService.listWishVenues(userId),
      venueDataService.listVenueNotes(userId),
      venueDataService.listCustomLabels(userId),
      venueDataService.listVenueLabels(userId),
      venueDataService.listCustomVenues(userId),
      checkinService.getVenueRatings(),
      menuPhotoService.listApprovedMenuPhotos(),
      venueCatalogService.listCatalogVenues(),
    ])

    return {
      profile,
      checkins,
      wishVenues,
      venueNotes,
      customLabels,
      venueLabels,
      customVenues,
      venueRatings,
      menuPhotos,
      catalogVenues,
    }
  },
}
