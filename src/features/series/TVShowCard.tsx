import React, { useState, useEffect } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Zoom,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Star,
  PlayArrow,
  Add,
  Remove,
  ShoppingCart,
  MovieCreation,
  YouTube,
  Close,
} from "@mui/icons-material";
import { TVShow, WatchProviders, Video } from "../../services/tmdbService";
import tmdbService from "../../services/tmdbService";
import watchlistService from "../../services/watchlistService";

interface TVShowCardProps {
  tvShow: TVShow;
  watchProviders?: WatchProviders | null;
  onFavoriteToggle?: (tvShowId: number) => void;
  isFavorite?: boolean;
}

const TVShowCard: React.FC<TVShowCardProps> = ({
  tvShow,
  watchProviders,
  onFavoriteToggle,
  isFavorite = false,
}) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailer, setTrailer] = useState<Video | null>(null);

  useEffect(() => {
    setIsInWatchlist(watchlistService.isInWatchlist(tvShow.id, "tv"));
  }, [tvShow.id]);

  useEffect(() => {
    const handleWatchlistUpdate = () => {
      setIsInWatchlist(watchlistService.isInWatchlist(tvShow.id, "tv"));
    };

    window.addEventListener("watchlistUpdated", handleWatchlistUpdate);
    return () =>
      window.removeEventListener("watchlistUpdated", handleWatchlistUpdate);
  }, [tvShow.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getYear = (dateString: string) => {
    return new Date(dateString).getFullYear().toString();
  };

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      watchlistService.removeFromWatchlist(tvShow.id, "tv");
    } else {
      watchlistService.addToWatchlist(tvShow, "tv");
    }
  };
  const handleTrailerClick = async () => {
    try {
      setTrailerOpen(true); 
      setTrailer(null); 

      const videos = await tmdbService.getTVShowVideos(tvShow.id);
      const foundTrailer = tmdbService.findOfficialTrailer(videos);

      if (foundTrailer) {
        setTrailer(foundTrailer);
      }
    } catch (error) {
      console.error("Erro ao buscar trailer:", error);
      setTrailer(null);
    }
  };

  const hasStreamingOptions =
    watchProviders?.flatrate && watchProviders.flatrate.length > 0;
  const renderStreamingProviders = () => {
    if (!watchProviders?.flatrate || watchProviders.flatrate.length === 0)
      return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Disponível em:
        </Typography>
        <Box
          sx={{
            py: 0.5,
            maxHeight: "70px",
            overflow: "auto",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              width: "6px",
              height: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(0,0,0,0.1)",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: "10px",
            },
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {watchProviders.flatrate.map((provider) => (
              <Chip
                key={provider.provider_id}
                label={provider.provider_name}
                size="small"
                color="success"
                variant="outlined"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  my: 0.3,
                }}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    );
  };
  const renderPurchaseOptions = () => {
    const year = getYear(tvShow.first_air_date);

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {hasStreamingOptions ? "Ou compre/alugue:" : "Onde assistir:"}
        </Typography>
        <Box
          sx={{
            py: 0.5,
            maxHeight: "100px",
            overflow: "auto",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(0,0,0,0.1)",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: "10px",
            },
          }}
        >
          <Stack spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ShoppingCart />}
              onClick={() =>
                window.open(
                  tmdbService.getGooglePlayMovieUrl(tvShow.name, year),
                  "_blank"
                )
              }
              sx={{ justifyContent: "flex-start" }}
            >
              Alugar na Google Play
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<YouTube />}
              onClick={() =>
                window.open(
                  tmdbService.getYouTubeMovieUrl(tvShow.name, year),
                  "_blank"
                )
              }
              sx={{ justifyContent: "flex-start" }}
            >
              Comprar no YouTube
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 4,
          },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="300"
            image={
              tvShow.poster_path
                ? tmdbService.getImageUrl(tvShow.poster_path)
                : "/assets/img/no-image.png"
            }
            alt={tvShow.name}
            sx={{ objectFit: "cover" }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Chip
              icon={<Star />}
              label={tvShow.vote_average.toFixed(1)}
              size="small"
              color="warning"
              sx={{
                backgroundColor: "rgba(0,0,0,0.8)",
                color: "white",
                "& .MuiChip-icon": { color: "gold" },
              }}
            />
            {onFavoriteToggle && (
              <Tooltip
                title={
                  isFavorite
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"
                }
              >
                <IconButton
                  size="small"
                  onClick={() => onFavoriteToggle(tvShow.id)}
                  sx={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.9)" },
                  }}
                >
                  {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
              </Tooltip>
            )}
            <Tooltip
              title={
                isInWatchlist
                  ? "Remover da lista"
                  : "Adicionar à lista de interesse"
              }
            >
              <IconButton
                size="small"
                onClick={handleWatchlistToggle}
                sx={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.9)" },
                }}
              >
                {isInWatchlist ? (
                  <Remove color="primary" />
                ) : (
                  <Add color="primary" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>{" "}
        <CardContent
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 3 }}
        >
          <Typography variant="h6" component="h3" gutterBottom>
            {tvShow.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {formatDate(tvShow.first_air_date)}
          </Typography>{" "}
          <Box
            sx={{
              flexGrow: 1,
              mb: 2.5,
              px: 0.5,
              height: "120px",
              overflow: "auto",
              scrollbarWidth: "thin",
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "rgba(0,0,0,0.1)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.2)",
                borderRadius: "10px",
              },
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {tvShow.overview || "Sem descrição disponível."}
            </Typography>
          </Box>
          <Divider sx={{ my: 2.5 }} />
          {renderStreamingProviders()}
          {!hasStreamingOptions && renderPurchaseOptions()}
          <Stack spacing={1} direction="row">
            {hasStreamingOptions && watchProviders?.link && (
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                size="small"
                onClick={() => window.open(watchProviders.link, "_blank")}
                sx={{ flex: 1 }}
              >
                Assistir
              </Button>
            )}

            <Button
              variant="outlined"
              startIcon={<MovieCreation />}
              size="small"
              onClick={handleTrailerClick}
              sx={{ flex: hasStreamingOptions ? 0 : 1 }}
            >
              Trailer
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Dialog
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionProps={{
          timeout: 500,
        }}
        TransitionComponent={Zoom}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: (theme) =>
              `0 16px 32px 0 ${
                theme.palette.mode === "light"
                  ? "rgba(0, 0, 0, 0.3)"
                  : "rgba(0, 0, 0, 0.8)"
              }`,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "primary.dark",
            color: "white",
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <MovieCreation sx={{ mr: 1 }} />
            {trailer?.name || `Trailer - ${tvShow.name}`}
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setTrailerOpen(false)}
            aria-label="fechar"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: "black" }}>
          {trailer && (
            <Box
              sx={{
                position: "relative",
                paddingBottom: "56.25%", // 16:9 aspect ratio
                height: 0,
                overflow: "hidden",
              }}
            >
              {" "}
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`}
                title={trailer.name}
                frameBorder="0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
            </Box>
          )}
          {!trailer && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 6,
                bgcolor: "background.default",
              }}
            >
              <YouTube sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Trailer não encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Não foi possível carregar o trailer desta série
              </Typography>
              <Button
                variant="contained"
                startIcon={<YouTube />}
                onClick={() =>
                  window.open(
                    `https://www.youtube.com/results?search_query=${encodeURIComponent(
                      tvShow.name + " trailer oficial"
                    )}`,
                    "_blank"
                  )
                }
              >
                Buscar no YouTube
              </Button>
            </Box>
          )}
        </DialogContent>
        {trailer && (
          <DialogActions
            sx={{
              bgcolor: "primary.dark",
              justifyContent: "space-between",
              px: 2,
            }}
          >
            <Typography variant="body2" color="white">
              {tvShow.name} • {getYear(tvShow.first_air_date)}
            </Typography>
            <Button
              variant="outlined"
              onClick={() =>
                window.open(
                  `https://www.youtube.com/watch?v=${trailer.key}`,
                  "_blank"
                )
              }
              startIcon={<YouTube />}
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
            >
              Ver no YouTube
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export default TVShowCard;
