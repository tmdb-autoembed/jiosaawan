import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "@/contexts/PlayerContext";
import TopBar from "@/components/TopBar";
import PlayerBar from "@/components/PlayerBar";
import ExpandedPlayer from "@/components/ExpandedPlayer";
import QueuePanel from "@/components/QueuePanel";
import Particles from "@/components/Particles";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import TabSearch from "./pages/TabSearch";
import AlbumDetail from "./pages/AlbumDetail";
import ArtistDetail from "./pages/ArtistDetail";
import PlaylistDetail from "./pages/PlaylistDetail";
import LyricsPage from "./pages/LyricsPage";
import PodcastsPage from "./pages/PodcastsPage";
import PodcastDetail from "./pages/PodcastDetail";
import Profile from "./pages/Profile";
import ChartsPage from "./pages/ChartsPage";
import RadioPage from "./pages/RadioPage";
import RadioDetail from "./pages/RadioDetail";
import ChannelDetail from "./pages/ChannelDetail";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PlayerProvider>
        <Sonner position="top-center" />
        <BrowserRouter>
          <Particles />
          <div className="min-h-screen max-w-[600px] mx-auto relative flex flex-col z-10">
            <TopBar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/search/songs" element={<TabSearch type="songs" />} />
                <Route path="/search/albums" element={<TabSearch type="albums" />} />
                <Route path="/search/artists" element={<TabSearch type="artists" />} />
                <Route path="/search/playlists" element={<TabSearch type="playlists" />} />
                <Route path="/search/podcasts" element={<TabSearch type="podcasts" />} />
                <Route path="/album/:id" element={<AlbumDetail />} />
                <Route path="/artist/:id" element={<ArtistDetail />} />
                <Route path="/playlist/:id" element={<PlaylistDetail />} />
                <Route path="/podcasts" element={<PodcastsPage />} />
                <Route path="/podcast/:id" element={<PodcastDetail />} />
                <Route path="/charts" element={<ChartsPage />} />
                <Route path="/radio" element={<RadioPage />} />
                <Route path="/radio/:id" element={<RadioDetail />} />
                <Route path="/channel/:id" element={<ChannelDetail />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/lyrics" element={<LyricsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
          <PlayerBar />
          <ExpandedPlayer />
          <QueuePanel />
        </BrowserRouter>
      </PlayerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
