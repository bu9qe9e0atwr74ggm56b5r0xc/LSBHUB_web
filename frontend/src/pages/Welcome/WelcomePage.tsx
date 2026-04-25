// ============================================================
// WelcomePage.tsx — Титульная страница (страница регистрации)
// ============================================================
// Структура файла:
//   1. Импорты
//   2. Константы и расчёт пиксельной сетки  ← ВОТ ЗДЕСЬ СЕТКА
//   3. Компонент PixelBackground (анимированный фон)
//   4. Утилиты валидации пароля
//   5. Компонент Field (поле ввода)
//   6. Компонент Check (строка подсказки пароля)
//   7. Главный компонент WelcomePage
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { registerApi } from '../../api/auth';
import axios from 'axios';


// ============================================================
// РАЗДЕЛ 1 — ПИКСЕЛЬНАЯ СЕТКА
// ============================================================
// Здесь настраивается внешний вид анимированного фона слева.
//
// COLS  — количество колонок (ячеек по горизонтали)
// ROWS  — количество строк  (ячеек по вертикали)
// CELL  — размер одной ячейки в пикселях
//
// Градиент: верхний-левый угол = чёрный (~10),
//           нижний-правый угол = белый (~220).
// Формула: t = среднее между нормализованной колонкой и строкой (0..1)
//          baseGray = GRAD_MIN + t * (GRAD_MAX - GRAD_MIN)
//
// GRAD_MIN — яркость самой тёмной ячейки (верхний левый угол)
// GRAD_MAX — яркость самой светлой ячейки (нижний правый угол)
//            255 = чисто белый, 0 = чисто чёрный
//
// SHIMMER_CHANCE — вероятность (0..1) что ячейка мигнёт за один кадр
// SHIMMER_AMP    — максимальное отклонение яркости при мигании (±)
// SHIMMER_SPEED  — каждые N кадров происходит обновление мерцания
//                  (60 fps / N = количество обновлений в секунду)
// ============================================================

const COLS = 16;          // ← количество столбцов сетки
const ROWS = 14;          // ← количество строк сетки
const CELL = 80;          // ← размер ячейки в пикселях

const GRAD_MIN = 10;      // ← яркость верхнего-левого угла (0–255)
const GRAD_MAX = 220;     // ← яркость нижнего-правого угла (0–255)

const SHIMMER_CHANCE = 0.035;  // ← вероятность мигания ячейки за кадр
const SHIMMER_AMP    = 28;     // ← амплитуда мерцания (±px яркости)
const SHIMMER_SPEED  = 8;      // ← обновление каждые N кадров (~60fps)

// Интерфейс одной ячейки сетки
interface GridCell {
  col: number;      // индекс столбца
  row: number;      // индекс строки
  baseGray: number; // базовая яркость ячейки по градиенту (0–255)
}

// buildGrid() — вычисляет базовую яркость каждой ячейки
// по диагональному градиенту (верхний-левый → нижний-правый)
function buildGrid(): GridCell[] {
  const cells: GridCell[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // t ∈ [0, 1]: 0 = верхний-левый угол, 1 = нижний-правый
      const t = (c / (COLS - 1) + r / (ROWS - 1)) / 2;
      const baseGray = Math.round(GRAD_MIN + t * (GRAD_MAX - GRAD_MIN));
      cells.push({ col: c, row: r, baseGray });
    }
  }
  return cells;
}

// Строим сетку один раз при загрузке модуля (не при каждом рендере)
const GRID = buildGrid();


// ============================================================
// РАЗДЕЛ 2 — КОМПОНЕНТ АНИМИРОВАННОГО ФОНА
// ============================================================
// PixelBackground отрисовывает сетку ячеек поверх тёмного
// подложки. Каждые SHIMMER_SPEED кадров случайные ячейки
// слегка меняют яркость (мерцание), затем плавно возвращаются
// к базовому значению через CSS transition.
// ============================================================

function PixelBackground() {
  // grays — массив текущих значений яркости (rgb) для каждой ячейки
  // Начальные значения берём прямо из baseGray сетки
  const [grays, setGrays] = useState<number[]>(() =>
    GRID.map((cell) => cell.baseGray)
  );

  // raf — ref для хранения id анимационного кадра (чтобы отменить при размонтировании)
  const raf = useRef<number | null>(null);

  useEffect(() => {
    let frame = 0;

    const animate = () => {
      frame++;

      // Обновляем яркости только каждые SHIMMER_SPEED кадров
      if (frame % SHIMMER_SPEED === 0) {
        setGrays((prev) =>
          prev.map((currentGray, i) => {
            // Случайно решаем, мигает ли эта ячейка
            if (Math.random() < SHIMMER_CHANCE) {
              const base = GRID[i].baseGray;
              // Отклоняемся от базовой яркости на случайную величину
              const delta = (Math.random() - 0.5) * 2 * SHIMMER_AMP;
              // Ограничиваем результат диапазоном [0, 255]
              return Math.max(0, Math.min(255, base + delta));
            }
            // Если ячейка не мигает — плавно возвращаем к базовому значению
            const base = GRID[i].baseGray;
            return currentGray + (base - currentGray) * 0.15;
          })
        );
      }

      // Запрашиваем следующий кадр
      raf.current = requestAnimationFrame(animate);
    };

    // Запускаем анимацию
    raf.current = requestAnimationFrame(animate);

    // Останавливаем анимацию при размонтировании компонента
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    // Контейнер на всю левую панель, тёмный фон под ячейками
    // (виден в зазорах между ячейками — 1px)
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: '#000000', // цвет зазоров между ячейками
      }}
    >
      {GRID.map((cell, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: cell.col * CELL,
            top: cell.row * CELL,
            width: CELL,
            height: CELL,
            // Яркость применяется ко всем трём каналам → оттенок серого
            backgroundColor: `rgb(${Math.round(grays[i])},${Math.round(grays[i])},${Math.round(grays[i])})`,
            // CSS transition обеспечивает плавное мерцание
            transition: 'background-color 0.55s ease',
          }}
        />
      ))}
    </div>
  );
}


// ============================================================
// РАЗДЕЛ 3 — ВАЛИДАЦИЯ ПАРОЛЯ
// ============================================================
// checkPassword возвращает объект с результатами четырёх проверок.
// Каждое поле — boolean: true = условие выполнено.
// ============================================================

interface PasswordChecks {
  length: boolean; // минимум 8 символов
  letter: boolean; // хотя бы одна буква (латиница или кириллица)
  digit: boolean;  // хотя бы одна цифра
  match: boolean;  // пароль и подтверждение совпадают
}

function checkPassword(password: string, confirm: string): PasswordChecks {
  return {
    length: password.length >= 8,
    letter: /[a-zA-Zа-яА-Я]/.test(password),
    digit:  /\d/.test(password),
    match:  password.length > 0 && password === confirm,
  };
}


// ============================================================
// РАЗДЕЛ 4 — КОМПОНЕНТ ПОЛЯ ВВОДА
// ============================================================
// Field — универсальный компонент для текстовых полей формы.
// При фокусе подсвечивает рамку фиолетовым (#a883ff),
// при ошибке — красным (#ef4444).
// ============================================================

interface FieldProps {
  label: string;                 // подпись над полем
  value: string;                 // текущее значение
  onChange: (v: string) => void; // обработчик изменения
  type?: string;                 // тип input: 'text' | 'email' | 'password'
  placeholder?: string;          // подсказка внутри поля
  error?: string;                // текст ошибки (если есть)
  disabled?: boolean;            // блокировка во время запроса
}

function Field({
  label, value, onChange, type = 'text',
  placeholder, error, disabled,
}: FieldProps) {
  // Локальное состояние фокуса для смены цвета рамки
  const [focused, setFocused] = useState(false);

  // Цвет рамки: ошибка → красный, фокус → фиолетовый, иначе → серый
  const borderColor = error ? '#ef4444' : focused ? '#a883ff' : '#2a2a2a';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {/* Подпись над полем */}
      <label style={{ color: '#d4d4d4', fontSize: 16, fontFamily: 'FactorA, sans-serif' }}>
        {label}
      </label>

      {/* Поле ввода */}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          backgroundColor: '#141414',
          border: `2px solid ${borderColor}`,
          color: '#ffffff',
          padding: '10px 14px',
          borderRadius: 5,
          fontSize: 24,
          outline: 'none',
          transition: 'border-color 0.2s',
          opacity: disabled ? 0.5 : 1,
          fontFamily: 'FactorA, sans-serif',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />

      {/* Сообщение об ошибке — показывается только при наличии */}
      {error && (
        <p style={{ color: '#ef4444', fontSize: 16, margin: 0, fontFamily: 'FactorA, sans-serif' }}>
          {error}
        </p>
      )}
    </div>
  );
}


// ============================================================
// РАЗДЕЛ 5 — КОМПОНЕНТ СТРОКИ ПОДСКАЗКИ ПАРОЛЯ
// ============================================================
// Check — одна строка в блоке требований к паролю.
// ok=true → зелёная галочка ✓
// ok=false → красный крестик ✗
// ============================================================

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 25,
      fontFamily: 'FactorA, sans-serif',
      fontSize: 16,
      color: '#d4d4d4',
    }}>
      {/* Иконка: цвет меняется в зависимости от результата проверки */}
      <span style={{
        color: ok ? '#4ade80' : '#ef4444', // зелёный или красный
        fontWeight: 700,
        fontSize: 16,
        width: 14,
        flexShrink: 0,
      }}>
        {ok ? '✓' : '✗'}
      </span>
      {label}
    </div>
  );
}


// ============================================================
// РАЗДЕЛ 6 — ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ
// ============================================================
// WelcomePage — точка входа для маршрута /welcome.
// Состоит из двух частей:
//   - Левая панель: анимированный пиксельный фон + информационный блок
//   - Правая панель: форма регистрации
// ============================================================

export default function WelcomePage() {
  const navigate = useNavigate();

  // Метод из Zustand-стора для сохранения токена и данных пользователя
  const setAuth = useAuthStore((s) => s.setAuth);

  // ── Состояния полей формы ──────────────────────────────────
  const [username, setUsername] = useState('');  // логин
  const [email, setEmail]       = useState('');  // email
  const [password, setPassword] = useState('');  // пароль
  const [confirm, setConfirm]   = useState('');  // подтверждение пароля

  // ── Состояния ошибок и загрузки ───────────────────────────
  // errors — словарь {поле: сообщение об ошибке} для клиентской валидации
  const [errors, setErrors]     = useState<Record<string, string>>({});
  // apiError — ошибка от сервера (не привязана к конкретному полю)
  const [apiError, setApiError] = useState('');
  // loading — true пока идёт запрос к бэкенду
  const [loading, setLoading]   = useState(false);

  // Вычисляем состояние проверок пароля реактивно при каждом рендере
  const checks = checkPassword(password, confirm);

  // ── Клиентская валидация ───────────────────────────────────
  // Возвращает true если все поля корректны, иначе — заполняет errors
  const validate = (): boolean => {
    const e: Record<string, string> = {};

    // Проверка логина
    if (username.length < 3)
      e.username = 'Минимум 3 символа';
    else if (username.length > 50)
      e.username = 'Максимум 50 символов';
    else if (!/^[a-zA-Z0-9]+$/.test(username))
      e.username = 'Только латинские буквы и цифры';

    // Проверка email
    if (!email.includes('@') || email.split('@')[1]?.indexOf('.') === -1)
      e.email = 'Некорректный email';

    // Проверка пароля (по приоритету условий)
    if (!checks.length)
      e.password = 'Минимум 8 символов';
    else if (!checks.letter)
      e.password = 'Нужна хотя бы одна буква';
    else if (!checks.digit)
      e.password = 'Нужна хотя бы одна цифра';

    // Проверка совпадения паролей
    if (!checks.match)
      e.confirm = 'Пароли не совпадают';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Обработчик кнопки "Создать аккаунт" ───────────────────
  const handleRegister = async () => {
    setApiError(''); // сбрасываем предыдущую ошибку сервера

    // Прерываем отправку, если есть ошибки валидации
    if (!validate()) return;

    setLoading(true);
    try {
      // Отправляем запрос на бэкенд (POST /api/auth/register)
      const result = await registerApi({ username, email, password });

      // При успехе — сохраняем токен и пользователя в Zustand-стор
      // (persist сохранит их в localStorage автоматически)
      setAuth(result.user, result.token);

      // Перенаправляем на страницу встраивания
      navigate('/encode');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Обрабатываем известные коды ошибок от нашего бэкенда
        const code = err.response?.data?.error;
        if (code === 'EMAIL_TAKEN')
          setErrors((p) => ({ ...p, email: 'Email уже занят' }));
        else if (code === 'USERNAME_TAKEN')
          setErrors((p) => ({ ...p, username: 'Логин уже занят' }));
        else
          setApiError('Ошибка сервера. Попробуйте снова.');
      } else {
        // Сетевая ошибка (бэкенд не запущен и т.п.)
        setApiError('Не удалось подключиться к серверу.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Рендер ────────────────────────────────────────────────
  return (
    // Корневой контейнер: flex-строка на весь экран
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: '#0a0a0a',
    }}>

      {/* ════════════════════════════════════════════════════
          ЛЕВАЯ ПАНЕЛЬ — пиксельный фон + информационный блок
          ════════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative',
        flex: 1,                    // занимает всё пространство кроме правой панели
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Анимированный пиксельный фон — описан в РАЗДЕЛЕ 1 и 2 выше */}
        <PixelBackground />

        {/* Информационная карточка поверх пиксельного фона */}
        <div style={{
          position: 'relative',
          zIndex: 10,                            // выше пиксельного фона
          backgroundColor: 'rgba(0,0,0,0.50)',   // полупрозрачный тёмный фон
          backdropFilter: 'blur(4px)',           // лёгкое размытие фона за карточкой
          borderRadius: 20,
          padding: '40px 40px',
          margin: '0 40px',
          maxWidth: 960,
        }}>
          {/* Название сайта — шрифт RimmaSans*/}
          <h1 style={{
            color: '#ffffff',
            fontFamily: 'RimmaSans, monospace', // ← используем кастомный шрифт
            fontSize: 96,
            margin: '-30px 0 10px', // ← убрал отрицательный margin, добавил отступ снизу
            textAlign: 'center',    // ← центрирование заголовка
          }}>
            LSB hub
          </h1>

          {/* Основной описательный текст — шрифт FactorA */}
          <p style={{
            color: '#ffffff',
            fontFamily: 'FactorA, sans-serif', // ← используем кастомный шрифт
            fontSize: 30,
            lineHeight: 1.2, // ← уменьшен интерлиньяж (было 1.5)
            margin: '0 0 20px',
          }}>
            Инструмент для встраивания и извлечения текста в растровых
            изображениях методом наименее значащего бита.
          </p>

          {/* Список возможностей — шрифт FactorA */}
          <ul style={{
            fontFamily: 'FactorA, sans-serif',
            color: '#ffffff',
            fontSize: 30,
            lineHeight: 1.4, // ← уменьшен интерлиньяж (было 2)
            paddingLeft: 0,
            listStyle: 'none',
            margin: 0,
          }}>
            {[
              'Несколько модификаций метода LSB с гибкой настройкой',
              'Визуализация изменений и метрики качества в реальном времени',
              'Образовательный раздел с интерактивным объяснением алгоритма',
              'История операций в личном кабинете',
            ].map((item) => (
              <li key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {/* Фиолетовая точка-маркер */}
                <span style={{ color: '#a883ff', lineHeight: 1, flexShrink: 0 }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          ПРАВАЯ ПАНЕЛЬ — форма регистрации
          ════════════════════════════════════════════════════ */}
      <div style={{
        width: 640,
        flexShrink: 0,
        backgroundColor: '#0a0a0a',
        overflowY: 'auto',             // прокрутка если контент не помещается
        padding: '48px 40px 40px',
        display: 'flex',
        flexDirection: 'column',
        // alignItems не задан → форма выровнена по левому краю (по умолчанию)
      }}>

        {/* Заголовок формы — шрифт RimmaSans */}
        <h2 style={{
          color: '#ffffff',
          fontFamily: 'RimmaSans, monospace', // ← используем кастомный шрифт
          fontSize: 40,
          fontWeight: 600,
          margin: '-35px -10px 0px',
        }}>
          Добро Пожаловать
        </h2>

        {/* Подзаголовок — шрифт FactorA */}
        <p style={{
          color: '#d4d4d4',
          fontFamily: 'FactorA, sans-serif',
          fontSize: 24,
          margin: '0 -10px 32px',
        }}>
          Создайте аккаунт, чтобы начать работу на сайте.
        </p>

        {/* Блок полей формы — вертикальный стек с зазорами */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Поле: логин */}
          <Field
            label="Введите логин"
            value={username}
            onChange={setUsername}
            placeholder="username"
            error={errors.username}
            disabled={loading}
          />

          {/* Поле: email */}
          <Field
            label="Введите электронную почту"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="example@mail.com"
            error={errors.email}
            disabled={loading}
          />

          {/* Поле: пароль + блок подсказок (всегда виден) */}
          <div>
            <Field
              label="Придумайте пароль"
              value={password}
              onChange={setPassword}
              type="password"
              placeholder="••••••••"
              error={errors.password}
              disabled={loading}
            />

            {/* ── Блок требований к паролю ──────────────────────
                Показывается ВСЕГДА (не только при вводе).
                Каждая строка — компонент Check с иконкой ✓/✗.
                ─────────────────────────────────────────────── */}
            <div style={{
              marginTop: 8,
              backgroundColor: '#141414',
              border: '2px solid #2a2a2a',
              borderRadius: 5,
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <Check ok={checks.length} label="Хотя бы 8 символов" />
              <Check ok={checks.letter} label="Хотя бы одна буква" />
              <Check ok={checks.digit}  label="Хотя бы одна цифра" />
              <Check ok={checks.match}  label="Пароли совпадают" />
            </div>
          </div>

          {/* Поле: подтверждение пароля */}
          <Field
            label="Подтвердите пароль"
            value={confirm}
            onChange={setConfirm}
            type="password"
            placeholder="••••••••"
            error={errors.confirm}
            disabled={loading}
          />

          {/* Ошибка от сервера (показывается под полями) */}
          {apiError && (
            <p style={{
              color: '#ef4444',
              fontSize: 16,
              margin: 0,
              textAlign: 'center',
              fontFamily: 'FactorA, sans-serif',
            }}>
              {apiError}
            </p>
          )}

          {/* Кнопка регистрации — фиолетовый акцент */}
          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              backgroundColor: '#a883ff',
              color: '#0a0a0a',
              border: '2px solid #2a2a2a',
              borderRadius: 5,
              padding: '7px',
              fontSize: 24,
              fontFamily: 'FactorA, sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#c4a8ff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#a883ff'; }}
          >
            {/* Текст кнопки меняется во время загрузки */}
            {loading ? 'Создание аккаунта...' : 'Создать аккаунт'}
          </button>

          {/* Разделитель с текстом "Уже есть аккаунт?" */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ flex: 1, height: 2, backgroundColor: '#ffffff' }} />
            <span style={{
              color: '#ffffff',
              fontSize: 24,
              whiteSpace: 'nowrap',
              fontFamily: 'FactorA, sans-serif',
            }}>
              Уже есть аккаунт?
            </span>
            <div style={{ flex: 1, height: 2, backgroundColor: '#ffffff' }} />
          </div>

          {/* Кнопка "Войти" — ведёт на страницу /login */}
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button
              style={{
                width: '100%',
                backgroundColor: '#141414',
                color: '#ffffff',
                border: '2px solid #2a2a2a',
                borderRadius: 5,
                maxWidth: 250,
                padding: '7px',
                fontSize: 24,
                fontFamily: 'FactorA, sans-serif',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                margin: '0 150px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a883ff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2a'; }}
            >
              Войти
            </button>
          </Link>

        </div>
      </div>
    </div>
  );
}