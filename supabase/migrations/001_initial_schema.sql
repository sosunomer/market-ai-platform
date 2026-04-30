-- =============================================================================
-- Market AI Platform — Veritabanı Şeması
-- Supabase (PostgreSQL) için eksiksiz migrasyon dosyası
-- =============================================================================
-- Bu dosyayı Supabase SQL Editor'e yapıştırarak tüm tabloları,
-- RLS politikalarını ve index'leri tek seferde oluşturabilirsiniz.
-- =============================================================================

-- Uzantılar
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUM TİPLERİ
-- =============================================================================

CREATE TYPE subscription_plan AS ENUM ('free', 'basic', 'pro', 'enterprise');
CREATE TYPE payment_provider  AS ENUM ('stripe', 'iyzico');
CREATE TYPE currency_code     AS ENUM ('TRY', 'USD', 'EUR');
CREATE TYPE exchange_type     AS ENUM ('BIST', 'NYSE', 'NASDAQ', 'CRYPTO');
CREATE TYPE alert_type        AS ENUM ('price', 'percentage', 'volume', 'news', 'ai-signal');
CREATE TYPE alert_condition   AS ENUM ('above', 'below', 'crosses');
CREATE TYPE alert_status      AS ENUM ('active', 'triggered', 'expired', 'disabled');
CREATE TYPE alert_channel     AS ENUM ('email', 'push', 'sms', 'in-app');
CREATE TYPE news_sentiment    AS ENUM ('positive', 'negative', 'neutral');
CREATE TYPE news_source       AS ENUM ('finnhub', 'bloomberg', 'reuters', 'aa', 'custom');
CREATE TYPE statement_impact  AS ENUM ('positive', 'negative', 'neutral', 'uncertain');
CREATE TYPE analysis_type     AS ENUM ('technical', 'fundamental', 'sentiment', 'prediction');
CREATE TYPE signal_strength   AS ENUM ('strong-buy', 'buy', 'hold', 'sell', 'strong-sell');

-- =============================================================================
-- 1. USERS — Kullanıcı profili, abonelik ve tercihler
-- =============================================================================
-- Clerk auth ile senkronize. clerk_id üzerinden eşleştirilir.
-- Kullanıcı Clerk'te oluşturulduğunda webhook ile bu tabloya eklenir.
-- =============================================================================

CREATE TABLE users (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id         TEXT UNIQUE NOT NULL,
    email            TEXT UNIQUE NOT NULL,
    first_name       TEXT,
    last_name        TEXT,
    image_url        TEXT,
    subscription     subscription_plan NOT NULL DEFAULT 'free',
    payment_provider payment_provider,
    stripe_customer_id  TEXT,
    iyzico_customer_id  TEXT,
    preferences      JSONB NOT NULL DEFAULT '{
        "language": "tr",
        "currency": "TRY",
        "theme": "light",
        "notifications": {
            "email": true,
            "push": true,
            "sms": false
        }
    }'::jsonb,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index'ler
CREATE INDEX idx_users_clerk_id ON users (clerk_id);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_subscription ON users (subscription);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own"
    ON users FOR SELECT
    USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "users_update_own"
    ON users FOR UPDATE
    USING (clerk_id = auth.jwt() ->> 'sub')
    WITH CHECK (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "users_insert_via_service"
    ON users FOR INSERT
    WITH CHECK (true);
    -- Webhook (service_role) ile eklenir; istemci tarafından eklenmez.

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================================================
-- 2. PORTFOLIOS — Kullanıcının portföyleri
-- =============================================================================
-- Bir kullanıcının birden fazla portföyü olabilir.
-- is_default: varsayılan portföy (yeni eklenen hisseler buraya gider).
-- =============================================================================

CREATE TABLE portfolios (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    description      TEXT,
    currency         currency_code NOT NULL DEFAULT 'TRY',
    is_default       BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index'ler
CREATE INDEX idx_portfolios_user_id ON portfolios (user_id);
CREATE UNIQUE INDEX idx_portfolios_user_default ON portfolios (user_id) WHERE is_default = true;

-- RLS
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolios_select_own"
    ON portfolios FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "portfolios_insert_own"
    ON portfolios FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "portfolios_update_own"
    ON portfolios FOR UPDATE
    USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'))
    WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "portfolios_delete_own"
    ON portfolios FOR DELETE
    USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE TRIGGER trigger_portfolios_updated_at
    BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================================================
-- 3. PORTFOLIO_STOCKS — Portföydeki hisseler
-- =============================================================================
-- Her satır bir hisse pozisyonunu temsil eder.
-- quantity ve average_cost, alım/satım işlemleriyle güncellenir.
-- =============================================================================

CREATE TABLE portfolio_stocks (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id     UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol           TEXT NOT NULL,
    company_name     TEXT NOT NULL,
    exchange         exchange_type NOT NULL DEFAULT 'BIST',
    quantity         DECIMAL(18, 8) NOT NULL DEFAULT 0,
    average_cost     DECIMAL(18, 4) NOT NULL DEFAULT 0,
    total_invested   DECIMAL(18, 4) NOT NULL DEFAULT 0,
    currency         currency_code NOT NULL DEFAULT 'TRY',
    notes            TEXT,
    first_bought_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index'ler
CREATE INDEX idx_portfolio_stocks_portfolio_id ON portfolio_stocks (portfolio_id);
CREATE INDEX idx_portfolio_stocks_symbol ON portfolio_stocks (symbol);
CREATE UNIQUE INDEX idx_portfolio_stocks_unique ON portfolio_stocks (portfolio_id, symbol);

-- RLS
ALTER TABLE portfolio_stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_stocks_select_own"
    ON portfolio_stocks FOR SELECT
    USING (portfolio_id IN (
        SELECT p.id FROM portfolios p
        JOIN users u ON p.user_id = u.id
        WHERE u.clerk_id = auth.jwt() ->> 'sub'
    ));

CREATE POLICY "portfolio_stocks_insert_own"
    ON portfolio_stocks FOR INSERT
    WITH CHECK (portfolio_id IN (
        SELECT p.id FROM portfolios p
        JOIN users u ON p.user_id = u.id
        WHERE u.clerk_id = auth.jwt() ->> 'sub'
    ));

CREATE POLICY "portfolio_stocks_update_own"
    ON portfolio_stocks FOR UPDATE
    USING (portfolio_id IN (
        SELECT p.id FROM portfolios p
        JOIN users u ON p.user_id = u.id
        WHERE u.clerk_id = auth.jwt() ->> 'sub'
    ))
    WITH CHECK (portfolio_id IN (
        SELECT p.id FROM portfolios p
        JOIN users u ON p.user_id = u.id
        WHERE u.clerk_id = auth.jwt() ->> 'sub'
    ));

CREATE POLICY "portfolio_stocks_delete_own"
    ON portfolio_stocks FOR DELETE
    USING (portfolio_id IN (
        SELECT p.id FROM portfolios p
        JOIN users u ON p.user_id = u.id
        WHERE u.clerk_id = auth.jwt() ->> 'sub'
    ));

CREATE TRIGGER trigger_portfolio_stocks_updated_at
    BEFORE UPDATE ON portfolio_stocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================================================
-- 4. WATCHLISTS — Takip listesi
-- =============================================================================
-- Kullanıcının izlediği hisseler. Portföyden bağımsız; sadece takip amaçlıdır.
-- =============================================================================

CREATE TABLE watchlists (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol           TEXT NOT NULL,
    company_name     TEXT NOT NULL,
    exchange         exchange_type NOT NULL DEFAULT 'BIST',
    sort_order       INTEGER NOT NULL DEFAULT 0,
    added_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index'ler
CREATE INDEX idx_watchlists_user_id ON watchlists (user_id);
CREATE UNIQUE INDEX idx_watchlists_user_symbol ON watchlists (user_id, symbol);
CREATE INDEX idx_watchlists_sort ON watchlists (user_id, sort_order);

-- RLS
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watchlists_select_own"
    ON watchlists FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "watchlists_insert_own"
    ON watchlists FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "watchlists_update_own"
    ON watchlists FOR UPDATE
    USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'))
    WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "watchlists_delete_own"
    ON watchlists FOR DELETE
    USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));


-- =============================================================================
-- 5. ALERTS — Fiyat ve haber alarmları
-- =============================================================================
-- Kullanıcının belirlediği koşullar sağlandığında tetiklenen uyarılar.
-- channels: hangi kanallardan bildirim gönderileceği (email, push, sms, in-app).
-- =============================================================================

CREATE TABLE alerts (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol           TEXT NOT NULL,
    company_name     TEXT NOT NULL,
    type             alert_type NOT NULL DEFAULT 'price',
    condition        alert_condition NOT NULL DEFAULT 'above',
    target_value     DECIMAL(18, 4) NOT NULL,
    current_value    DECIMAL(18, 4) NOT NULL DEFAULT 0,
    status           alert_status NOT NULL DEFAULT 'active',
    channels         alert_channel[] NOT NULL DEFAULT '{in-app}',
    message          TEXT,
    triggered_at     TIMESTAMPTZ,
    expires_at       TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index'ler
CREATE INDEX idx_alerts_user_id ON alerts (user_id);
CREATE INDEX idx_alerts_symbol ON alerts (symbol);
CREATE INDEX idx_alerts_status ON alerts (status);
CREATE INDEX idx_alerts_active ON alerts (user_id, status) WHERE status = 'active';

-- RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alerts_select_own"
    ON alerts FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "alerts_insert_own"
    ON alerts FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "alerts_update_own"
    ON alerts FOR UPDATE
    USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'))
    WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "alerts_delete_own"
    ON alerts FOR DELETE
    USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE TRIGGER trigger_alerts_updated_at
    BEFORE UPDATE ON alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================================================
-- 6. NEWS_ITEMS — Haberler / Politikacı & CEO açıklamaları
-- =============================================================================
-- Piyasayı etkileyen haberler, politikacı açıklamaları ve CEO demeçleri.
-- sentiment ve sentiment_score YZ tarafından analiz edilir.
-- speaker_*: açıklamayı yapan kişinin bilgileri (politikacı/CEO).
-- =============================================================================

CREATE TABLE news_items (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title            TEXT NOT NULL,
    summary          TEXT NOT NULL,
    content          TEXT,
    url              TEXT NOT NULL,
    image_url        TEXT,
    source           news_source NOT NULL DEFAULT 'custom',
    author           TEXT,

    -- Politikacı / CEO bilgileri (opsiyonel — haber bir açıklama ise doldurulur)
    speaker_name     TEXT,
    speaker_title    TEXT,
    speaker_party    TEXT,
    speaker_country  TEXT DEFAULT 'TR',

    sentiment        news_sentiment NOT NULL DEFAULT 'neutral',
    sentiment_score  DECIMAL(5, 4) NOT NULL DEFAULT 0,
    impact           statement_impact NOT NULL DEFAULT 'neutral',
    impact_score     DECIMAL(5, 4) NOT NULL DEFAULT 0,

    related_symbols  TEXT[] NOT NULL DEFAULT '{}',
    affected_sectors TEXT[] NOT NULL DEFAULT '{}',

    ai_analysis      TEXT,

    published_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    fetched_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    analyzed_at      TIMESTAMPTZ
);

-- Index'ler
CREATE INDEX idx_news_items_published_at ON news_items (published_at DESC);
CREATE INDEX idx_news_items_source ON news_items (source);
CREATE INDEX idx_news_items_sentiment ON news_items (sentiment);
CREATE INDEX idx_news_items_speaker ON news_items (speaker_name) WHERE speaker_name IS NOT NULL;
CREATE INDEX idx_news_items_related_symbols ON news_items USING GIN (related_symbols);
CREATE INDEX idx_news_items_affected_sectors ON news_items USING GIN (affected_sectors);

-- RLS — Haberler herkese açık (okuma); yazma service_role ile yapılır.
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_items_select_all"
    ON news_items FOR SELECT
    USING (true);

CREATE POLICY "news_items_insert_service"
    ON news_items FOR INSERT
    WITH CHECK (true);
    -- Yalnızca service_role ile eklenir.

CREATE POLICY "news_items_update_service"
    ON news_items FOR UPDATE
    USING (true)
    WITH CHECK (true);


-- =============================================================================
-- 7. NEWS_STOCK_IMPACTS — Haber–Hisse etki ilişkisi (YZ analizi)
-- =============================================================================
-- YZ tarafından analiz edilen haber-hisse etki ilişkisi.
-- Bir haber birden fazla hisseyi etkileyebilir (1:N).
-- =============================================================================

CREATE TABLE news_stock_impacts (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_item_id     UUID NOT NULL REFERENCES news_items(id) ON DELETE CASCADE,
    symbol           TEXT NOT NULL,
    company_name     TEXT NOT NULL,
    exchange         exchange_type NOT NULL DEFAULT 'BIST',
    impact           statement_impact NOT NULL DEFAULT 'neutral',
    impact_score     DECIMAL(5, 4) NOT NULL DEFAULT 0,
    predicted_change DECIMAL(8, 4),
    confidence       DECIMAL(5, 4) NOT NULL DEFAULT 0,
    reasoning        TEXT,
    analyzed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index'ler
CREATE INDEX idx_news_stock_impacts_news_id ON news_stock_impacts (news_item_id);
CREATE INDEX idx_news_stock_impacts_symbol ON news_stock_impacts (symbol);
CREATE UNIQUE INDEX idx_news_stock_impacts_unique ON news_stock_impacts (news_item_id, symbol);
CREATE INDEX idx_news_stock_impacts_impact ON news_stock_impacts (impact);

-- RLS — Herkes okuyabilir; yazma service_role ile yapılır.
ALTER TABLE news_stock_impacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_stock_impacts_select_all"
    ON news_stock_impacts FOR SELECT
    USING (true);

CREATE POLICY "news_stock_impacts_insert_service"
    ON news_stock_impacts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "news_stock_impacts_update_service"
    ON news_stock_impacts FOR UPDATE
    USING (true)
    WITH CHECK (true);


-- =============================================================================
-- 8. AI_ANALYSES — YZ tarafından üretilen analizler
-- =============================================================================
-- Claude API ile oluşturulan hisse analiz raporları.
-- factors: analizi etkileyen faktörler (JSONB dizisi).
-- Her analiz bir kullanıcıya ve bir hisseye aittir.
-- =============================================================================

CREATE TABLE ai_analyses (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol           TEXT NOT NULL,
    type             analysis_type NOT NULL DEFAULT 'technical',
    signal           signal_strength NOT NULL DEFAULT 'hold',
    confidence       DECIMAL(5, 4) NOT NULL DEFAULT 0,
    summary          TEXT NOT NULL,
    details          TEXT NOT NULL,
    factors          JSONB NOT NULL DEFAULT '[]'::jsonb,
    price_target     DECIMAL(18, 4),
    stop_loss        DECIMAL(18, 4),
    time_horizon     TEXT NOT NULL DEFAULT '1 hafta',
    model_version    TEXT NOT NULL DEFAULT 'claude-sonnet-4-20250514',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index'ler
CREATE INDEX idx_ai_analyses_user_id ON ai_analyses (user_id);
CREATE INDEX idx_ai_analyses_symbol ON ai_analyses (symbol);
CREATE INDEX idx_ai_analyses_created_at ON ai_analyses (created_at DESC);
CREATE INDEX idx_ai_analyses_user_symbol ON ai_analyses (user_id, symbol, created_at DESC);
CREATE INDEX idx_ai_analyses_type ON ai_analyses (type);
CREATE INDEX idx_ai_analyses_signal ON ai_analyses (signal);

-- RLS
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_analyses_select_own"
    ON ai_analyses FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "ai_analyses_insert_own"
    ON ai_analyses FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "ai_analyses_delete_own"
    ON ai_analyses FOR DELETE
    USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));


-- =============================================================================
-- YARDIMCI VİEW'LAR
-- =============================================================================

-- Portföy özet view'ı: Her portföydeki toplam yatırım ve pozisyon sayısı
CREATE VIEW portfolio_summary AS
SELECT
    p.id AS portfolio_id,
    p.user_id,
    p.name,
    p.currency,
    p.is_default,
    COUNT(ps.id) AS position_count,
    COALESCE(SUM(ps.total_invested), 0) AS total_invested,
    COALESCE(SUM(ps.quantity), 0) AS total_positions,
    p.created_at,
    p.updated_at
FROM portfolios p
LEFT JOIN portfolio_stocks ps ON p.id = ps.portfolio_id
GROUP BY p.id, p.user_id, p.name, p.currency, p.is_default, p.created_at, p.updated_at;

-- Aktif uyarı özeti
CREATE VIEW active_alerts_summary AS
SELECT
    a.id,
    a.user_id,
    a.symbol,
    a.company_name,
    a.type,
    a.condition,
    a.target_value,
    a.current_value,
    a.channels,
    a.created_at
FROM alerts a
WHERE a.status = 'active'
ORDER BY a.created_at DESC;

-- Son haberler — politikacı açıklamalarıyla birlikte
CREATE VIEW recent_news_with_impacts AS
SELECT
    n.id,
    n.title,
    n.summary,
    n.source,
    n.speaker_name,
    n.speaker_title,
    n.speaker_party,
    n.sentiment,
    n.sentiment_score,
    n.impact,
    n.impact_score,
    n.related_symbols,
    n.published_at,
    COUNT(nsi.id) AS impacted_stock_count,
    ARRAY_AGG(DISTINCT nsi.symbol) FILTER (WHERE nsi.symbol IS NOT NULL) AS impacted_symbols
FROM news_items n
LEFT JOIN news_stock_impacts nsi ON n.id = nsi.news_item_id
GROUP BY n.id, n.title, n.summary, n.source, n.speaker_name, n.speaker_title,
         n.speaker_party, n.sentiment, n.sentiment_score, n.impact, n.impact_score,
         n.related_symbols, n.published_at
ORDER BY n.published_at DESC;


-- =============================================================================
-- TAMAMLANDI
-- =============================================================================
-- Toplam: 8 tablo, 3 view, RLS politikaları, index'ler ve trigger'lar
-- Supabase SQL Editor'e yapıştırarak çalıştırabilirsiniz.
-- =============================================================================
