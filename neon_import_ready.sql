--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (415ebe8)
-- Dumped by pg_dump version 17.5


ALTER TABLE IF EXISTS ONLY public.user_follows DROP CONSTRAINT IF EXISTS user_follows_following_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_follows DROP CONSTRAINT IF EXISTS user_follows_follower_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_badges DROP CONSTRAINT IF EXISTS user_badges_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_badges DROP CONSTRAINT IF EXISTS user_badges_badge_id_fkey;
ALTER TABLE IF EXISTS ONLY public.recipes DROP CONSTRAINT IF EXISTS recipes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.recipe_views DROP CONSTRAINT IF EXISTS recipe_views_recipe_id_fkey;
ALTER TABLE IF EXISTS ONLY public.recipe_ratings DROP CONSTRAINT IF EXISTS recipe_ratings_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.recipe_ratings DROP CONSTRAINT IF EXISTS recipe_ratings_recipe_id_fkey;
ALTER TABLE IF EXISTS ONLY public.recipe_likes DROP CONSTRAINT IF EXISTS recipe_likes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.recipe_likes DROP CONSTRAINT IF EXISTS recipe_likes_recipe_id_fkey;
ALTER TABLE IF EXISTS ONLY public.recipe_favorites DROP CONSTRAINT IF EXISTS recipe_favorites_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.recipe_favorites DROP CONSTRAINT IF EXISTS recipe_favorites_recipe_id_fkey;
ALTER TABLE IF EXISTS ONLY public.recipe_comments DROP CONSTRAINT IF EXISTS recipe_comments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.recipe_comments DROP CONSTRAINT IF EXISTS recipe_comments_recipe_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
DROP TRIGGER IF EXISTS trigger_update_level ON public.users;
DROP TRIGGER IF EXISTS trigger_points_on_recipe ON public.recipes;
DROP TRIGGER IF EXISTS trigger_points_on_like ON public.recipe_likes;
DROP TRIGGER IF EXISTS trigger_comment_notification ON public.recipe_comments;
DROP TRIGGER IF EXISTS trigger_award_badges ON public.users;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.user_follows DROP CONSTRAINT IF EXISTS user_follows_pkey;
ALTER TABLE IF EXISTS ONLY public.user_follows DROP CONSTRAINT IF EXISTS user_follows_follower_id_following_id_key;
ALTER TABLE IF EXISTS ONLY public.user_badges DROP CONSTRAINT IF EXISTS user_badges_user_id_badge_id_key;
ALTER TABLE IF EXISTS ONLY public.user_badges DROP CONSTRAINT IF EXISTS user_badges_pkey;
ALTER TABLE IF EXISTS ONLY public.recipes DROP CONSTRAINT IF EXISTS recipes_pkey;
ALTER TABLE IF EXISTS ONLY public.recipe_views DROP CONSTRAINT IF EXISTS recipe_views_recipe_id_key;
ALTER TABLE IF EXISTS ONLY public.recipe_views DROP CONSTRAINT IF EXISTS recipe_views_pkey;
ALTER TABLE IF EXISTS ONLY public.recipe_ratings DROP CONSTRAINT IF EXISTS recipe_ratings_recipe_id_user_id_key;
ALTER TABLE IF EXISTS ONLY public.recipe_ratings DROP CONSTRAINT IF EXISTS recipe_ratings_pkey;
ALTER TABLE IF EXISTS ONLY public.recipe_likes DROP CONSTRAINT IF EXISTS recipe_likes_recipe_id_user_id_key;
ALTER TABLE IF EXISTS ONLY public.recipe_likes DROP CONSTRAINT IF EXISTS recipe_likes_pkey;
ALTER TABLE IF EXISTS ONLY public.recipe_favorites DROP CONSTRAINT IF EXISTS recipe_favorites_user_id_recipe_id_key;
ALTER TABLE IF EXISTS ONLY public.recipe_favorites DROP CONSTRAINT IF EXISTS recipe_favorites_pkey;
ALTER TABLE IF EXISTS ONLY public.recipe_comments DROP CONSTRAINT IF EXISTS recipe_comments_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.badges DROP CONSTRAINT IF EXISTS badges_pkey;
ALTER TABLE IF EXISTS ONLY public.badges DROP CONSTRAINT IF EXISTS badges_name_key;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_follows ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_badges ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.recipes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.recipe_views ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.recipe_ratings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.recipe_likes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.recipe_favorites ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.recipe_comments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.badges ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_follows_id_seq;
DROP TABLE IF EXISTS public.user_follows;
DROP SEQUENCE IF EXISTS public.user_badges_id_seq;
DROP TABLE IF EXISTS public.user_badges;
DROP SEQUENCE IF EXISTS public.recipes_id_seq;
DROP TABLE IF EXISTS public.recipes;
DROP SEQUENCE IF EXISTS public.recipe_views_id_seq;
DROP TABLE IF EXISTS public.recipe_views;
DROP SEQUENCE IF EXISTS public.recipe_ratings_id_seq;
DROP TABLE IF EXISTS public.recipe_ratings;
DROP SEQUENCE IF EXISTS public.recipe_likes_id_seq;
DROP TABLE IF EXISTS public.recipe_likes;
DROP SEQUENCE IF EXISTS public.recipe_favorites_id_seq;
DROP TABLE IF EXISTS public.recipe_favorites;
DROP SEQUENCE IF EXISTS public.recipe_comments_id_seq;
DROP TABLE IF EXISTS public.recipe_comments;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.badges_id_seq;
DROP TABLE IF EXISTS public.badges;
DROP FUNCTION IF EXISTS public.update_user_points_on_recipe();
DROP FUNCTION IF EXISTS public.update_user_points_on_like();
DROP FUNCTION IF EXISTS public.update_user_level();
DROP FUNCTION IF EXISTS public.create_comment_notification();
DROP FUNCTION IF EXISTS public.award_badges();
--
-- Name: award_badges(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.award_badges() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      DECLARE
        recipe_count INTEGER;
        total_likes INTEGER;
        first_recipe_badge_id INTEGER;
        recipe_master_badge_id INTEGER;
        popular_badge_id INTEGER;
      BEGIN
        SELECT COUNT(*) INTO recipe_count FROM recipes WHERE user_id = NEW.id;
        SELECT COUNT(*) INTO total_likes FROM recipe_likes rl 
        JOIN recipes r ON rl.recipe_id = r.id WHERE r.user_id = NEW.id;
        
        -- Get badge IDs
        SELECT id INTO first_recipe_badge_id FROM badges WHERE name = 'First Recipe' LIMIT 1;
        SELECT id INTO recipe_master_badge_id FROM badges WHERE name = 'Recipe Master' LIMIT 1;
        SELECT id INTO popular_badge_id FROM badges WHERE name = 'Popular' LIMIT 1;
        
        -- First Recipe badge
        IF recipe_count >= 1 AND first_recipe_badge_id IS NOT NULL THEN
          INSERT INTO user_badges (user_id, badge_id)
          VALUES (NEW.id, first_recipe_badge_id)
          ON CONFLICT DO NOTHING;
        END IF;
        
        -- Recipe Master badge (20+ recipes)
        IF recipe_count >= 20 AND recipe_master_badge_id IS NOT NULL THEN
          INSERT INTO user_badges (user_id, badge_id)
          VALUES (NEW.id, recipe_master_badge_id)
          ON CONFLICT DO NOTHING;
        END IF;
        
        -- Popular badge (100+ likes)
        IF total_likes >= 100 AND popular_badge_id IS NOT NULL THEN
          INSERT INTO user_badges (user_id, badge_id)
          VALUES (NEW.id, popular_badge_id)
          ON CONFLICT DO NOTHING;
        END IF;
        
        RETURN NEW;
      END;
      $$;


--
-- Name: create_comment_notification(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_comment_notification() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      DECLARE
        recipe_owner_id INTEGER;
        recipe_name VARCHAR(255);
        commenter_name VARCHAR(255);
      BEGIN
        SELECT user_id, name INTO recipe_owner_id, recipe_name FROM recipes WHERE id = NEW.recipe_id;
        SELECT username INTO commenter_name FROM users WHERE id = NEW.user_id;
        
        IF recipe_owner_id != NEW.user_id THEN
          INSERT INTO notifications (user_id, type, message, related_id)
          VALUES (
            recipe_owner_id,
            'comment',
            commenter_name || ' commented on your recipe "' || recipe_name || '"',
            NEW.recipe_id
          );
        END IF;
        RETURN NEW;
      END;
      $$;


--
-- Name: update_user_level(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_level() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF NEW.points >= 500 THEN
          NEW.user_level = 'Master Chef';
        ELSIF NEW.points >= 200 THEN
          NEW.user_level = 'Chef';
        ELSIF NEW.points >= 50 THEN
          NEW.user_level = 'Amateur';
        ELSE
          NEW.user_level = 'Novice';
        END IF;
        RETURN NEW;
      END;
      $$;


--
-- Name: update_user_points_on_like(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_points_on_like() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      DECLARE
        recipe_owner_id INTEGER;
      BEGIN
        SELECT user_id INTO recipe_owner_id FROM recipes WHERE id = NEW.recipe_id;
        UPDATE users SET points = points + 5 WHERE id = recipe_owner_id;
        RETURN NEW;
      END;
      $$;


--
-- Name: update_user_points_on_recipe(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_points_on_recipe() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        UPDATE users SET points = points + 10 WHERE id = NEW.user_id;
        RETURN NEW;
      END;
      $$;




--
-- Name: badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.badges (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon character varying(50),
    requirement_type character varying(50),
    requirement_value integer
);


--
-- Name: badges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.badges_id_seq OWNED BY public.badges.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    type character varying(50),
    message text,
    related_id integer,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: recipe_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_comments (
    id integer NOT NULL,
    recipe_id integer,
    user_id integer,
    comment text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: recipe_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipe_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipe_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipe_comments_id_seq OWNED BY public.recipe_comments.id;


--
-- Name: recipe_favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_favorites (
    id integer NOT NULL,
    user_id integer,
    recipe_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: recipe_favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipe_favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipe_favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipe_favorites_id_seq OWNED BY public.recipe_favorites.id;


--
-- Name: recipe_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_likes (
    id integer NOT NULL,
    recipe_id integer,
    user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: recipe_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipe_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipe_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipe_likes_id_seq OWNED BY public.recipe_likes.id;


--
-- Name: recipe_ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_ratings (
    id integer NOT NULL,
    recipe_id integer,
    user_id integer,
    rating integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT recipe_ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: recipe_ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipe_ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipe_ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipe_ratings_id_seq OWNED BY public.recipe_ratings.id;


--
-- Name: recipe_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_views (
    id integer NOT NULL,
    recipe_id integer,
    views integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: recipe_views_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipe_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipe_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipe_views_id_seq OWNED BY public.recipe_views.id;


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipes (
    id integer NOT NULL,
    user_id integer,
    name character varying(255) NOT NULL,
    description text,
    ingredients text,
    instructions text,
    category character varying(100),
    tags character varying(255),
    image_url text,
    difficulty_level character varying(20) DEFAULT 'Medium'::character varying,
    cooking_time integer,
    calories integer,
    servings integer DEFAULT 4,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;


--
-- Name: user_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_badges (
    id integer NOT NULL,
    user_id integer,
    badge_id integer,
    earned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_badges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_badges_id_seq OWNED BY public.user_badges.id;


--
-- Name: user_follows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_follows (
    id integer NOT NULL,
    follower_id integer,
    following_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_follows_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_follows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_follows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_follows_id_seq OWNED BY public.user_follows.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    bio text,
    avatar_url text,
    user_level character varying(50) DEFAULT 'Novice'::character varying,
    points integer DEFAULT 0,
    dark_mode boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: badges id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges ALTER COLUMN id SET DEFAULT nextval('public.badges_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: recipe_comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_comments ALTER COLUMN id SET DEFAULT nextval('public.recipe_comments_id_seq'::regclass);


--
-- Name: recipe_favorites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_favorites ALTER COLUMN id SET DEFAULT nextval('public.recipe_favorites_id_seq'::regclass);


--
-- Name: recipe_likes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_likes ALTER COLUMN id SET DEFAULT nextval('public.recipe_likes_id_seq'::regclass);


--
-- Name: recipe_ratings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ratings ALTER COLUMN id SET DEFAULT nextval('public.recipe_ratings_id_seq'::regclass);


--
-- Name: recipe_views id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_views ALTER COLUMN id SET DEFAULT nextval('public.recipe_views_id_seq'::regclass);


--
-- Name: recipes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);


--
-- Name: user_badges id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges ALTER COLUMN id SET DEFAULT nextval('public.user_badges_id_seq'::regclass);


--
-- Name: user_follows id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_follows ALTER COLUMN id SET DEFAULT nextval('public.user_follows_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: badges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.badges (id, name, description, icon, requirement_type, requirement_value) FROM stdin;
1	First Recipe	Posted your first recipe!	🍳	recipes_count	1
2	5 Star Chef	Received a 5-star rating!	⭐	five_star_rating	1
3	Popular	Got 100 likes on your recipes!	❤️	total_likes	100
4	Social Butterfly	Following 10+ users!	🦋	following_count	10
5	Recipe Master	Posted 20+ recipes!	👨‍🍳	recipes_count	20
7	Rising Star	Received 50 likes	⭐	total_likes	50
8	Master Chef	Posted 20 recipes	👨‍🍳	recipes_count	20
9	Community Favorite	Received 100 likes	❤️	total_likes	100
10	Culinary Legend	Reached 500 total views	🏆	total_views	500
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, message, related_id, is_read, created_at) FROM stdin;
1	1	comment	JamieFoodie commented on your recipe "Spaghetti Carbonara"	1	f	2025-11-15 13:38:05.563164
2	1	comment	JamieFoodie commented on your recipe "Chicken Tikka Masala"	2	f	2025-11-15 13:38:05.584116
3	1	comment	JuliaCooks commented on your recipe "Chicken Tikka Masala"	2	f	2025-11-15 13:38:05.602907
4	1	comment	JamieFoodie commented on your recipe "Classic Margherita Pizza"	4	f	2025-11-15 13:38:05.638172
5	1	comment	JuliaCooks commented on your recipe "Beef Wellington"	5	f	2025-11-15 13:38:05.655594
6	1	comment	JuliaCooks commented on your recipe "Beef Wellington"	5	f	2025-11-15 13:38:05.673141
7	2	comment	JamieFoodie commented on your recipe "Pad Thai"	6	f	2025-11-15 13:38:05.690548
8	2	comment	GordonChef commented on your recipe "Pad Thai"	6	f	2025-11-15 13:38:05.707966
9	2	comment	GordonChef commented on your recipe "Chocolate Lava Cake"	8	f	2025-11-15 13:38:05.743816
10	3	comment	GordonChef commented on your recipe "Sushi Rolls"	10	f	2025-11-15 13:38:05.780164
\.


--
-- Data for Name: recipe_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipe_comments (id, recipe_id, user_id, comment, created_at) FROM stdin;
1	1	1	Easy to follow recipe, turned out great!	2025-11-15 13:38:05.525203
2	1	1	Easy to follow recipe, turned out great!	2025-11-15 13:38:05.545686
3	1	3	Easy to follow recipe, turned out great!	2025-11-15 13:38:05.563164
4	2	3	Easy to follow recipe, turned out great!	2025-11-15 13:38:05.584116
5	2	2	Best recipe I've tried so far!	2025-11-15 13:38:05.602907
6	3	1	Best recipe I've tried so far!	2025-11-15 13:38:05.620337
7	4	3	Best recipe I've tried so far!	2025-11-15 13:38:05.638172
8	5	2	Best recipe I've tried so far!	2025-11-15 13:38:05.655594
9	5	2	Absolutely delicious! Made this for dinner tonight.	2025-11-15 13:38:05.673141
10	6	3	My family loved this dish!	2025-11-15 13:38:05.690548
11	6	1	Absolutely delicious! Made this for dinner tonight.	2025-11-15 13:38:05.707966
12	7	2	Best recipe I've tried so far!	2025-11-15 13:38:05.726488
13	8	1	My family loved this dish!	2025-11-15 13:38:05.743816
14	9	3	My family loved this dish!	2025-11-15 13:38:05.762946
15	10	1	Absolutely delicious! Made this for dinner tonight.	2025-11-15 13:38:05.780164
16	10	3	Best recipe I've tried so far!	2025-11-15 13:38:05.797512
17	10	3	Best recipe I've tried so far!	2025-11-15 13:38:05.815424
\.


--
-- Data for Name: recipe_favorites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipe_favorites (id, user_id, recipe_id, created_at) FROM stdin;
1	1	1	2025-11-15 13:38:05.832788
3	2	2	2025-11-15 13:38:05.871465
4	3	2	2025-11-15 13:38:05.889186
5	1	3	2025-11-15 13:38:05.906598
6	3	3	2025-11-15 13:38:05.923845
7	2	4	2025-11-15 13:38:05.941369
8	1	4	2025-11-15 13:38:05.95894
9	2	5	2025-11-15 13:38:05.976648
10	1	5	2025-11-15 13:38:05.994171
11	1	6	2025-11-15 13:38:06.012095
12	2	6	2025-11-15 13:38:06.029822
13	3	7	2025-11-15 13:38:06.04738
15	3	8	2025-11-15 13:38:06.082258
16	1	8	2025-11-15 13:38:06.099559
17	2	9	2025-11-15 13:38:06.116939
18	1	10	2025-11-15 13:38:06.135866
\.


--
-- Data for Name: recipe_likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipe_likes (id, recipe_id, user_id, created_at) FROM stdin;
1	1	1	2025-11-15 13:38:04.26091
2	1	2	2025-11-15 13:38:04.280961
4	2	1	2025-11-15 13:38:04.316258
5	2	3	2025-11-15 13:38:04.334043
6	2	2	2025-11-15 13:38:04.35192
7	3	2	2025-11-15 13:38:04.369631
8	3	1	2025-11-15 13:38:04.387233
9	3	3	2025-11-15 13:38:04.406417
10	4	2	2025-11-15 13:38:04.423756
11	4	3	2025-11-15 13:38:04.441153
13	5	1	2025-11-15 13:38:04.476794
14	5	3	2025-11-15 13:38:04.494219
15	5	2	2025-11-15 13:38:04.511705
16	6	2	2025-11-15 13:38:04.529161
17	6	3	2025-11-15 13:38:04.546625
19	7	3	2025-11-15 13:38:04.583705
21	7	1	2025-11-15 13:38:04.618723
22	8	2	2025-11-15 13:38:04.636844
25	9	1	2025-11-15 13:38:04.689492
26	9	2	2025-11-15 13:38:04.708039
28	10	2	2025-11-15 13:38:04.742832
29	10	1	2025-11-15 13:38:04.760231
\.


--
-- Data for Name: recipe_ratings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipe_ratings (id, recipe_id, user_id, rating, created_at) FROM stdin;
1	1	1	4	2025-11-15 13:38:04.795105
2	1	2	4	2025-11-15 13:38:04.814738
3	1	3	5	2025-11-15 13:38:04.832174
4	2	1	5	2025-11-15 13:38:04.84973
5	2	2	4	2025-11-15 13:38:04.867061
6	2	3	5	2025-11-15 13:38:04.884963
7	3	1	4	2025-11-15 13:38:04.902795
8	3	2	5	2025-11-15 13:38:04.921514
9	3	3	5	2025-11-15 13:38:04.938834
10	4	1	4	2025-11-15 13:38:04.95611
11	4	2	4	2025-11-15 13:38:04.973547
12	4	3	5	2025-11-15 13:38:04.991371
13	5	1	4	2025-11-15 13:38:05.008903
14	5	2	4	2025-11-15 13:38:05.03182
15	5	3	4	2025-11-15 13:38:05.049414
16	6	1	4	2025-11-15 13:38:05.066989
17	6	2	5	2025-11-15 13:38:05.08667
18	6	3	5	2025-11-15 13:38:05.10408
19	7	1	4	2025-11-15 13:38:05.121696
20	7	2	5	2025-11-15 13:38:05.139017
21	7	3	5	2025-11-15 13:38:05.156398
22	8	1	5	2025-11-15 13:38:05.173705
23	8	2	4	2025-11-15 13:38:05.19111
24	8	3	5	2025-11-15 13:38:05.2087
25	9	1	5	2025-11-15 13:38:05.226039
26	9	2	4	2025-11-15 13:38:05.243652
27	9	3	4	2025-11-15 13:38:05.260948
28	10	1	5	2025-11-15 13:38:05.285904
29	10	2	5	2025-11-15 13:38:05.313521
30	10	3	4	2025-11-15 13:38:05.330932
\.


--
-- Data for Name: recipe_views; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipe_views (id, recipe_id, views, created_at) FROM stdin;
1	1	171	2025-11-15 13:38:05.348412
2	2	215	2025-11-15 13:38:05.368624
3	3	184	2025-11-15 13:38:05.386098
4	4	75	2025-11-15 13:38:05.403502
5	5	100	2025-11-15 13:38:05.42106
6	6	243	2025-11-15 13:38:05.438518
7	7	249	2025-11-15 13:38:05.455688
8	8	54	2025-11-15 13:38:05.472928
9	9	145	2025-11-15 13:38:05.490296
10	10	202	2025-11-15 13:38:05.507585
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipes (id, user_id, name, description, ingredients, instructions, category, tags, image_url, difficulty_level, cooking_time, calories, servings, created_at) FROM stdin;
1	1	Spaghetti Carbonara	A delicious Spaghetti Carbonara recipe that will wow your taste buds! Perfect for any occasion.	["Ingredient 1","Ingredient 2","Ingredient 3","Ingredient 4","Ingredient 5"]	["Step 1: Prepare ingredients","Step 2: Cook","Step 3: Serve hot"]	Italian	\N	https://source.unsplash.com/800x600/?Spaghetti-Carbonara	Easy	30	\N	4	2025-11-15 13:38:04.05692
2	1	Chicken Tikka Masala	A delicious Chicken Tikka Masala recipe that will wow your taste buds! Perfect for any occasion.	["Ingredient 1","Ingredient 2","Ingredient 3","Ingredient 4","Ingredient 5"]	["Step 1: Prepare ingredients","Step 2: Cook","Step 3: Serve hot"]	Indian	\N	https://source.unsplash.com/800x600/?Chicken-Tikka-Masala	Medium	45	\N	4	2025-11-15 13:38:04.081073
3	1	French Onion Soup	A delicious French Onion Soup recipe that will wow your taste buds! Perfect for any occasion.	["Ingredient 1","Ingredient 2","Ingredient 3","Ingredient 4","Ingredient 5"]	["Step 1: Prepare ingredients","Step 2: Cook","Step 3: Serve hot"]	French	\N	https://source.unsplash.com/800x600/?French-Onion-Soup	Medium	60	\N	4	2025-11-15 13:38:04.099705
4	1	Classic Margherita Pizza	A delicious Classic Margherita Pizza recipe that will wow your taste buds! Perfect for any occasion.	["Ingredient 1","Ingredient 2","Ingredient 3","Ingredient 4","Ingredient 5"]	["Step 1: Prepare ingredients","Step 2: Cook","Step 3: Serve hot"]	Italian	\N	https://source.unsplash.com/800x600/?Classic-Margherita-Pizza	Easy	25	\N	4	2025-11-15 13:38:04.117974
5	1	Beef Wellington	A delicious Beef Wellington recipe that will wow your taste buds! Perfect for any occasion.	["Ingredient 1","Ingredient 2","Ingredient 3","Ingredient 4","Ingredient 5"]	["Step 1: Prepare ingredients","Step 2: Cook","Step 3: Serve hot"]	British	\N	https://source.unsplash.com/800x600/?Beef-Wellington	Hard	120	\N	4	2025-11-15 13:38:04.136575
6	2	Pad Thai	A delicious Pad Thai recipe that will wow your taste buds! Perfect for any occasion.	["Ingredient 1","Ingredient 2","Ingredient 3","Ingredient 4","Ingredient 5"]	["Step 1: Prepare ingredients","Step 2: Cook","Step 3: Serve hot"]	Thai	\N	https://source.unsplash.com/800x600/?Pad-Thai	Medium	35	\N	4	2025-11-15 13:38:04.154933
7	2	Caesar Salad	A delicious Caesar Salad recipe that will wow your taste buds! Perfect for any occasion.	["Ingredient 1","Ingredient 2","Ingredient 3","Ingredient 4","Ingredient 5"]	["Step 1: Prepare ingredients","Step 2: Cook","Step 3: Serve hot"]	American	\N	https://source.unsplash.com/800x600/?Caesar-Salad	Easy	15	\N	4	2025-11-15 13:38:04.179113
8	2	Chocolate Lava Cake	A delicious Chocolate Lava Cake recipe that will wow your taste buds! Perfect for any occasion.	["Ingredient 1","Ingredient 2","Ingredient 3","Ingredient 4","Ingredient 5"]	["Step 1: Prepare ingredients","Step 2: Cook","Step 3: Serve hot"]	Dessert	\N	https://source.unsplash.com/800x600/?Chocolate-Lava-Cake	Medium	40	\N	4	2025-11-15 13:38:04.203249
9	3	Tacos Al Pastor	A delicious Tacos Al Pastor recipe that will wow your taste buds! Perfect for any occasion.	["Ingredient 1","Ingredient 2","Ingredient 3","Ingredient 4","Ingredient 5"]	["Step 1: Prepare ingredients","Step 2: Cook","Step 3: Serve hot"]	Mexican	\N	https://source.unsplash.com/800x600/?Tacos-Al-Pastor	Medium	50	\N	4	2025-11-15 13:38:04.223275
10	3	Sushi Rolls	A delicious Sushi Rolls recipe that will wow your taste buds! Perfect for any occasion.	["Ingredient 1","Ingredient 2","Ingredient 3","Ingredient 4","Ingredient 5"]	["Step 1: Prepare ingredients","Step 2: Cook","Step 3: Serve hot"]	Japanese	\N	https://source.unsplash.com/800x600/?Sushi-Rolls	Hard	90	\N	4	2025-11-15 13:38:04.242026
\.


--
-- Data for Name: user_badges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_badges (id, user_id, badge_id, earned_at) FROM stdin;
1	1	1	2025-11-15 13:38:04.05692
6	2	1	2025-11-15 13:38:04.154933
9	3	1	2025-11-15 13:38:04.223275
34	1	2	2025-11-15 13:38:06.298079
36	2	2	2025-11-15 13:38:06.332919
38	3	2	2025-11-15 13:38:06.37111
\.


--
-- Data for Name: user_follows; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_follows (id, follower_id, following_id, created_at) FROM stdin;
1	1	2	2025-11-15 13:38:06.153394
2	1	3	2025-11-15 13:38:06.174129
3	2	1	2025-11-15 13:38:06.191709
4	2	3	2025-11-15 13:38:06.209031
5	3	1	2025-11-15 13:38:06.226599
6	3	2	2025-11-15 13:38:06.246327
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, password, bio, avatar_url, user_level, points, dark_mode, created_at) FROM stdin;
2	JuliaCooks	julia@demo.com	$2b$10$f8Rsf6EvmO8JVguGKAD3Ve9VVLekm9KWCAX1.sWLrn./yNfp8lTjS	Passionate chef sharing delicious recipes! 🍽️	https://ui-avatars.com/api/?name=JuliaCooks&background=random	Chef	335	f	2025-11-15 13:38:04.021564
3	JamieFoodie	jamie@demo.com	$2b$10$f8Rsf6EvmO8JVguGKAD3Ve9VVLekm9KWCAX1.sWLrn./yNfp8lTjS	Passionate chef sharing delicious recipes! 🍽️	https://ui-avatars.com/api/?name=JamieFoodie&background=random	Amateur	190	f	2025-11-15 13:38:04.039149
1	GordonChef	gordon@demo.com	$2b$10$f8Rsf6EvmO8JVguGKAD3Ve9VVLekm9KWCAX1.sWLrn./yNfp8lTjS	Passionate chef sharing delicious recipes! 🍽️	https://ui-avatars.com/api/?name=GordonChef&background=random	Master Chef	565	f	2025-11-15 13:38:04.001504
\.


--
-- Name: badges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.badges_id_seq', 10, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 10, true);


--
-- Name: recipe_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recipe_comments_id_seq', 17, true);


--
-- Name: recipe_favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recipe_favorites_id_seq', 18, true);


--
-- Name: recipe_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recipe_likes_id_seq', 30, true);


--
-- Name: recipe_ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recipe_ratings_id_seq', 30, true);


--
-- Name: recipe_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recipe_views_id_seq', 10, true);


--
-- Name: recipes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recipes_id_seq', 10, true);


--
-- Name: user_badges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_badges_id_seq', 38, true);


--
-- Name: user_follows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_follows_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: badges badges_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_name_key UNIQUE (name);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: recipe_comments recipe_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_comments
    ADD CONSTRAINT recipe_comments_pkey PRIMARY KEY (id);


--
-- Name: recipe_favorites recipe_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_favorites
    ADD CONSTRAINT recipe_favorites_pkey PRIMARY KEY (id);


--
-- Name: recipe_favorites recipe_favorites_user_id_recipe_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_favorites
    ADD CONSTRAINT recipe_favorites_user_id_recipe_id_key UNIQUE (user_id, recipe_id);


--
-- Name: recipe_likes recipe_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_likes
    ADD CONSTRAINT recipe_likes_pkey PRIMARY KEY (id);


--
-- Name: recipe_likes recipe_likes_recipe_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_likes
    ADD CONSTRAINT recipe_likes_recipe_id_user_id_key UNIQUE (recipe_id, user_id);


--
-- Name: recipe_ratings recipe_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ratings
    ADD CONSTRAINT recipe_ratings_pkey PRIMARY KEY (id);


--
-- Name: recipe_ratings recipe_ratings_recipe_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ratings
    ADD CONSTRAINT recipe_ratings_recipe_id_user_id_key UNIQUE (recipe_id, user_id);


--
-- Name: recipe_views recipe_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_views
    ADD CONSTRAINT recipe_views_pkey PRIMARY KEY (id);


--
-- Name: recipe_views recipe_views_recipe_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_views
    ADD CONSTRAINT recipe_views_recipe_id_key UNIQUE (recipe_id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_user_id_badge_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE (user_id, badge_id);


--
-- Name: user_follows user_follows_follower_id_following_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_follower_id_following_id_key UNIQUE (follower_id, following_id);


--
-- Name: user_follows user_follows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users trigger_award_badges; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_award_badges AFTER UPDATE OF points ON public.users FOR EACH ROW EXECUTE FUNCTION public.award_badges();


--
-- Name: recipe_comments trigger_comment_notification; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_comment_notification AFTER INSERT ON public.recipe_comments FOR EACH ROW EXECUTE FUNCTION public.create_comment_notification();


--
-- Name: recipe_likes trigger_points_on_like; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_points_on_like AFTER INSERT ON public.recipe_likes FOR EACH ROW EXECUTE FUNCTION public.update_user_points_on_like();


--
-- Name: recipes trigger_points_on_recipe; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_points_on_recipe AFTER INSERT ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_user_points_on_recipe();


--
-- Name: users trigger_update_level; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_level BEFORE UPDATE OF points ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_user_level();


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: recipe_comments recipe_comments_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_comments
    ADD CONSTRAINT recipe_comments_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_comments recipe_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_comments
    ADD CONSTRAINT recipe_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: recipe_favorites recipe_favorites_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_favorites
    ADD CONSTRAINT recipe_favorites_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_favorites recipe_favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_favorites
    ADD CONSTRAINT recipe_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: recipe_likes recipe_likes_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_likes
    ADD CONSTRAINT recipe_likes_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_likes recipe_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_likes
    ADD CONSTRAINT recipe_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: recipe_ratings recipe_ratings_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ratings
    ADD CONSTRAINT recipe_ratings_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_ratings recipe_ratings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ratings
    ADD CONSTRAINT recipe_ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: recipe_views recipe_views_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_views
    ADD CONSTRAINT recipe_views_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipes recipes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_badges user_badges_badge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id) ON DELETE CASCADE;


--
-- Name: user_badges user_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_follows user_follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_follows user_follows_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

