# Arquitectura Versaltech

## 🎨 UI General
- Header
  - Navegación
  - Carrito (CartSheet)
  - Perfil usuario
- Home (`app/page.tsx`)
  - Hero
  - FeaturesSection
  - HowWeWorkSection
  - FAQSection
  - CTASection
- About (`app/sobre-nosotros`)
  - AboutUs
  - AboutHistoryValues
  - AboutTeam
  - AboutReach

## 🛒 Tienda (Solo Lectura - Frontend)
- Lista Productos (`app/productos/page.tsx`)
  - ProductsSection → lee directamente de `config/data.ts` (array `products`)
  - ProductCard → usa directamente `Product` de `data.ts`
  - ProductFilters → filtra en el frontend con `useMemo`, sin servicios
- Página Producto (`app/productos/[id]/page.tsx`)
  - Busca producto directamente en array `products` de `data.ts`
  - ProductImageGallery
  - ProductConfigurator → usa directamente `Product` con opciones de `storageOptions`, `colorOptions`, etc.
- Carrito & Checkout
  - CartSheet (carrito lateral) - usa `CartContext`
  - Checkout (`app/checkout/page.tsx`)
    - **Estado actual**: ✅ Usa `checkoutService.processCheckout()` para procesar el pedido completo
    - **Validación de stock**: Valida stock antes de crear el pedido
    - **Persistencia**: Crea el pedido en base de datos usando `ordersService.createOrder()`
    - **Actualización de stock**: Reduce automáticamente el stock de las variaciones
    - **Confirmación**: Muestra confirmación con número de pedido generado por el servicio
  - OrderConfirmation - muestra confirmación visual del pedido

**Nota**: Los componentes de la tienda trabajan directamente con `Product` de `config/data.ts` sin usar servicios. Esto simplifica el código y mejora el rendimiento. En el futuro, cuando se migre a base de datos, se puede cambiar `config/data.ts` para que lea de la base de datos en lugar de datos estáticos.

## 👨‍💼 Admin (CRUD - Modifica Datos)
- Panel (`app/admin/page.tsx`)
- Usuarios (`app/admin/usuarios/page.tsx`)
  - Aprobar/rechazar usuarios
  - Gestionar acceso
- Productos (`app/admin/productos/page.tsx`)
  - **Lectura**: Lee directamente de `config/data.ts` → array `products` (igual que la tienda)
  - **Creación**: Usa `productsService.createProduct()` + `variationsService.createVariation()` para crear productos
  - **Modal de crear producto**: Dos secciones visuales claras:
    1. **Información del Producto** (fondo azul): Categoría, Marca, Modelo, Descripción
    2. **Primera Variación** (fondo verde): Storage, Color, Tipo, Condición, Precio, Stock
  - Lista todos los productos (sin filtros - si se necesitan, se pueden agregar en frontend)
  - Editar producto (`app/admin/productos/[id]/page.tsx`)
    - **Lectura**: Lee producto directamente de `config/data.ts` y variaciones de `variationsService.getProductVariations()`
    - **Gestión de variaciones**: Usa `variationsService` para crear, actualizar y eliminar variaciones
    - Muestra todas las variaciones en una tabla
    - Permite agregar nuevas variaciones con un configurador similar a `ProductConfigurator`
- Pedidos (`app/admin/pedidos/page.tsx`)
  - **Lectura**: Usa `ordersService.getAllOrders()` para obtener todos los pedidos
  - **Gestión de estados**: Permite actualizar el estado de los pedidos usando `ordersService.updateOrderStatus()`
  - **Vista por tabs**: Filtra pedidos por estado (Todos, Pendientes, En Proceso, Enviados, Entregados)
  - **Detalles de pedido**: Muestra información completa del pedido usando `ordersService.getOrderItems()`
  - **Estados disponibles**: pending, processing, shipped, delivered, cancelled

## 🔄 Estado Global
- AuthContext → localStorage
- CartContext → useReducer

## 📦 Servicios

Los servicios son capas de abstracción para operaciones de base de datos. **✅ TODOS los servicios están migrados a Supabase** para persistencia completa. Todos los datos se guardan en la base de datos y persisten entre sesiones.

**Estado de migración**:
- ✅ `ordersService` - Migrado a Supabase
- ✅ `checkoutService` - Migrado a Supabase  
- ✅ `productsService` - Migrado a Supabase (lectura y escritura)
- ✅ `usersService` - Migrado a Supabase
- ✅ `variationsService` - Migrado a Supabase

**Nota sobre lectura de productos**: Aunque `productsService` lee de Supabase, la tienda y el admin aún leen directamente de `config/data.ts` (datos estáticos) por compatibilidad. El objetivo es migrar también la lectura a Supabase en el futuro.

---

### productsService

**Propósito**: Gestiona productos (Create, Read, Update, Delete)

**⚠️ IMPORTANTE**: Este servicio ahora usa **Supabase** para persistencia real. Los productos se guardan en la base de datos y persisten entre sesiones.

**Almacenamiento**: Tabla `products` de Supabase

**Lectura de productos**: 
- **Tienda**: Lee directamente de `config/data.ts` → array `products` (datos estáticos)
- **Admin**: También lee directamente de `config/data.ts` → array `products` (datos estáticos)
- **Servicios**: `getProducts()` y `getProduct()` leen de Supabase (usado por `checkoutService` para validar stock)

**Funciones principales**:

1. **`getProducts()`**
   - **Retorna**: `Promise<Product[]>` - Todos los productos con sus variaciones
   - **Uso**: `checkoutService` para validar stock durante el checkout
   - **Implementación**: 
     - Consulta tabla `products` de Supabase
     - Obtiene variaciones de cada producto usando `variationsService.getProductVariations()`
     - Transforma `DatabaseProduct` + variaciones a `Product`
   - **Estado**: ✅ Implementado con Supabase

2. **`getProduct(id: string)`**
   - **Retorna**: `Promise<Product | null>` - Producto encontrado con sus variaciones
   - **Uso**: `checkoutService` para validar stock de un producto específico
   - **Implementación**: 
     - Consulta tabla `products` de Supabase por ID
     - Obtiene variaciones usando `variationsService.getProductVariations()`
     - Transforma a `Product`
   - **Estado**: ✅ Implementado con Supabase

3. **`createProduct(productData: Partial<DatabaseProduct>)`**
   - **Retorna**: `Promise<DatabaseProduct>` - El producto creado
   - **Uso**: Admin (`app/admin/productos/page.tsx`) para crear nuevos productos base
   - **Implementación**: 
     - Inserta en tabla `products` de Supabase
     - Crea solo el producto base (name, description, brand, model, category, images)
     - Aplica valores por defecto si faltan campos
   - **Nota**: Después de crear el producto, se debe crear la primera variación con `variationsService.createVariation()`
   - **Estado**: ✅ Implementado con Supabase

4. **`updateProduct(id: string, updates: Partial<DatabaseProduct>)`**
   - **Retorna**: `Promise<DatabaseProduct>` - El producto actualizado
   - **Uso**: Admin para editar productos (actualmente no se usa en ninguna página, pero está disponible)
   - **Implementación**: 
     - Actualiza tabla `products` de Supabase
     - Actualiza `updated_at` automáticamente
   - **Estado**: ✅ Implementado con Supabase

5. **`deleteProduct(id: string)`**
   - **Retorna**: `Promise<void>`
   - **Uso**: Admin para eliminar productos (actualmente no se usa en ninguna página, pero está disponible)
   - **Implementación**: Elimina de tabla `products` de Supabase
   - **Estado**: ✅ Implementado con Supabase


**Estructura de datos** (`DatabaseProduct`):
- Identificadores: `id`, `name`, `brand`, `model`
- Categorización: `category`, `region`, `product_type`, `condition`
- Especificaciones: `storage`, `color`, `battery_health`, `accessories` (campos opcionales, se obtienen de la primera variación)
- Precio y stock: `price`, `stock_quantity`, `in_stock` (campos opcionales, se obtienen de la primera variación)
- Multimedia: `images` (array de URLs)
- Metadatos: `created_at`, `updated_at`

**Nota**: Los campos `storage`, `color`, `condition`, `productType`, `price`, `stock`, `region`, `batteryHealth` ahora están en las variaciones (`ProductVariation`), no en el producto base. El producto base solo tiene información común (name, description, category, images, accessories).

---

### usersService

**Propósito**: Gestiona usuarios del sistema B2B (registro, aprobación, roles)

**⚠️ IMPORTANTE**: Este servicio ahora usa **Supabase** para persistencia real. Los usuarios se guardan en la base de datos y persisten entre sesiones.

**Almacenamiento**: Tabla `users` de Supabase

**Funciones principales**:

1. **`getAllUsers()`**
   - **Retorna**: `Promise<User[]>` - Todos los usuarios
   - **Uso**: Admin (`app/admin/usuarios/page.tsx`) para listar usuarios
   - **Implementación**: Consulta tabla `users` de Supabase, ordenado por fecha descendente
   - **Estado**: ✅ Implementado con Supabase

2. **`getPendingUsers()`**
   - **Retorna**: `Promise<User[]>` - Usuarios con `approved: false`
   - **Uso**: Admin para ver solicitudes pendientes de aprobación
   - **Implementación**: Consulta tabla `users` de Supabase filtrado por `approved = false`
   - **Estado**: ✅ Implementado con Supabase

3. **`getUserById(id: string)`**
   - **Retorna**: `Promise<User | null>` - Usuario encontrado o null
   - **Uso**: Obtener datos de un usuario específico
   - **Implementación**: Consulta tabla `users` de Supabase por ID
   - **Estado**: ✅ Implementado con Supabase

4. **`getUserByEmail(email: string)`**
   - **Retorna**: `Promise<User | null>` - Usuario encontrado o null
   - **Uso**: Login (`app/login/page.tsx`) para autenticación
   - **Implementación**: Consulta tabla `users` de Supabase por email
   - **Estado**: ✅ Implementado con Supabase

5. **`createUser(userData)`**
   - **Retorna**: `Promise<User | null>` - Usuario creado
   - **Uso**: Registro (`app/registro/page.tsx`) para nuevos usuarios
   - **Implementación**: 
     - Inserta en tabla `users` de Supabase
     - Establece `approved: false` por defecto (requiere aprobación admin)
     - Asigna `role: 'user'` por defecto
     - Timestamps se generan automáticamente
   - **Estado**: ✅ Implementado con Supabase

6. **`updateUser(id: string, updates: Partial<DatabaseUser>)`**
   - **Retorna**: `Promise<User | null>` - Usuario actualizado
   - **Uso**: 
     - Admin para aprobar usuarios
     - Admin para cambiar roles
     - Perfil para actualizar datos personales
   - **Implementación**: 
     - Actualiza tabla `users` de Supabase
     - Actualiza `updated_at` automáticamente
   - **Estado**: ✅ Implementado con Supabase

7. **`deleteUser(id: string)`**
   - **Retorna**: `Promise<boolean>` - `true` si se eliminó, `false` si no existía
   - **Uso**: Admin para rechazar usuarios
   - **Implementación**: Elimina de tabla `users` de Supabase
   - **Estado**: ✅ Implementado con Supabase

**Funciones auxiliares**:

8. **`isUserApproved(userId: string)`**
    - **Retorna**: `Promise<boolean>` - Estado de aprobación
    - **Uso**: Middleware/protección de rutas
    - **Implementación**: Obtiene usuario y retorna `approved ?? false`
    - **Estado**: ✅ Implementado

**Nota sobre wrappers eliminados**: 
- ❌ `approveUser()` - **Eliminado**. Usar directamente `updateUser(userId, { approved: true })`
- ❌ `rejectUser()` - **Eliminado**. Usar directamente `deleteUser(userId)`
- ❌ `updateUserRole()` - **Eliminado**. Usar directamente `updateUser(userId, { role })`

El código del admin (`app/admin/usuarios/page.tsx`) usa directamente `updateUser()` y `deleteUser()` para simplificar y eliminar capas innecesarias.

**Estructura de datos** (`User` / `DatabaseUser`):
- Identificación: `id`, `email`, `name`, `company`
- Datos B2B: `cif`, `business_email`, `phone`
- Dirección: `address`, `city`, `postal_code`, `country`
- Permisos: `approved` (boolean), `role` ('user' | 'admin')
- Metadatos: `created_at`, `updated_at`

**Flujo de aprobación**:
1. Usuario se registra → `createUser()` con `approved: false`
2. Admin ve pendientes → `getPendingUsers()`
3. Admin aprueba → `updateUser(userId, { approved: true })`
4. Admin rechaza → `deleteUser(userId)` (elimina el usuario)
5. Usuario puede acceder → `isUserApproved()` retorna `true`

---

### variationsService

**Propósito**: Gestiona variaciones de productos (storage, color, condition, price, stock)

**⚠️ IMPORTANTE**: Este servicio ahora usa **Supabase** para persistencia real. Las variaciones se guardan en la base de datos y persisten entre sesiones.

**Almacenamiento**: Tabla `product_variations` de Supabase

**Estructura simplificada**:
- Cada `Product` tiene un array `variations: ProductVariation[]`
- Cada variación es simple: `{ id, storage, color, condition, productType, price, stock }`
- Ejemplo real: 
  ```typescript
  variations: [
    { id: "uuid-1", storage: "64GB", color: "Rosa", condition: "A+", productType: "CPO", price: 180.00, stock: 5 },
    { id: "uuid-2", storage: "64GB", color: "Oro", condition: "A+", productType: "CPO", price: 185.00, stock: 3 },
    { id: "uuid-3", storage: "128GB", color: "Verde", condition: "A+", productType: "CPO", price: 195.00, stock: 10 }
  ]
  ```

**Cómo funciona ahora**:
- **Tienda**: `ProductCard` y `ProductConfigurator` usan directamente `product.variations[]` de `config/data.ts` (datos estáticos)
- **Filtros**: `ProductFilters` extrae opciones únicas de todas las variaciones de todos los productos usando `useMemo`
- **Configurator**: 
  - Selecciona una variación por ID y muestra su precio y stock específicos
  - Muestra todas las opciones disponibles (storages, colors, conditions, productTypes) de todas las variaciones
  - Las opciones no disponibles para la selección actual se muestran deshabilitadas visualmente pero son clickeables
  - Al hacer clic en una opción no disponible, busca automáticamente una variación que tenga esa opción (priorizando mantener otras selecciones)
- **Admin**: Usa `variationsService` para CRUD de variaciones (lee/escribe de Supabase)
- **Checkout**: Usa `variationsService.getVariationById()` para validar stock desde Supabase

**Estructura de `ProductVariation`** (simplificada al máximo):
```typescript
interface ProductVariation {
  id: string;                    // "1-v1", "1-v2", etc.
  storage: string;               // "64GB", "128GB", etc.
  color: string;                 // "Rosa", "Oro", "Negro", etc.
  condition: 'NUEVO' | 'A+' | 'A' | 'B';
  productType: 'NUEVO' | 'CPO' | 'ASIS' | 'REACONDICIONADO' | 'USADO';
  price: number;                 // Precio específico de esta variación
  stock: number;                 // Stock específico de esta variación
}
```

**Funciones del servicio**:

1. **`getProductVariations(productId: string)`**
   - **Retorna**: `Promise<ProductVariation[]>` - Todas las variaciones de un producto
   - **Uso**: Admin para listar variaciones, `productsService` para obtener variaciones de un producto
   - **Implementación**: Consulta tabla `product_variations` de Supabase filtrado por `product_id`
   - **Estado**: ✅ Implementado con Supabase

2. **`getVariationById(id: string)`**
   - **Retorna**: `Promise<ProductVariation>` - Una variación por ID
   - **Uso**: Admin para obtener detalles, `checkoutService` para validar stock
   - **Implementación**: Consulta tabla `product_variations` de Supabase por ID
   - **Estado**: ✅ Implementado con Supabase

3. **`createVariation(productId: string, variationData: Partial<ProductVariation>)`**
   - **Retorna**: `Promise<ProductVariation>` - Variación creada
   - **Uso**: Admin para crear nuevas variaciones
   - **Implementación**: 
     - Inserta en tabla `product_variations` de Supabase
     - Requiere `productId` y los datos básicos (storage, color, condition, productType, price, stock)
   - **Estado**: ✅ Implementado con Supabase

4. **`updateVariation(id: string, updates: Partial<ProductVariation>)`**
   - **Retorna**: `Promise<ProductVariation>` - Variación actualizada
   - **Uso**: Admin para editar variaciones, `checkoutService` para actualizar stock
   - **Implementación**: Actualiza tabla `product_variations` de Supabase
   - **Estado**: ✅ Implementado con Supabase

5. **`deleteVariation(id: string)`**
   - **Retorna**: `Promise<void>`
   - **Uso**: Admin para eliminar variaciones
   - **Implementación**: Elimina de tabla `product_variations` de Supabase
   - **Estado**: ✅ Implementado con Supabase

**Funciones auxiliares**:
- `getAvailableOptions(productId: string)` - Extrae opciones únicas (storages, colors, etc.) de las variaciones desde Supabase

---

### ordersService

**Propósito**: Gestiona pedidos/órdenes de compra

**⚠️ IMPORTANTE**: Este servicio ahora usa **Supabase** para persistencia real. Los pedidos se guardan en la base de datos y persisten entre sesiones.

**Almacenamiento**: Tablas de Supabase (`orders` y `order_items`)

**Funciones principales**:

1. **`createOrder(orderData: Partial<DatabaseOrder>)`**
   - **Retorna**: `Promise<Order>` - Pedido creado
   - **Uso**: Checkout para crear el pedido después de validar
   - **Implementación**: 
     - Genera `order_number` único: `B2B-${Date.now().toString().slice(-6)}`
     - Establece `status: 'pending'` por defecto
     - Inserta en tabla `orders` de Supabase
   - **Estado**: ✅ Implementado con Supabase

2. **`createOrderItem(itemData)`**
   - **Retorna**: `Promise<void>`
   - **Uso**: Interno, para crear items de un pedido
   - **Parámetros**: `order_id`, `product_id`, `variation_id?`, `quantity`, `price`
   - **Implementación**: Inserta en tabla `order_items` de Supabase, guarda información de variación (storage, color, condition)
   - **Estado**: ✅ Implementado con Supabase

3. **`getOrderById(id: string)`**
   - **Retorna**: `Promise<Order | null>` - Pedido encontrado
   - **Uso**: Página de confirmación, historial de pedidos
   - **Implementación**: Consulta tabla `orders` de Supabase por ID
   - **Estado**: ✅ Implementado con Supabase

4. **`getOrdersByUserId(userId: string)`**
   - **Retorna**: `Promise<Order[]>` - Historial de pedidos del usuario
   - **Uso**: Perfil del usuario (`app/perfil/page.tsx`) para ver pedidos anteriores
   - **Implementación**: Consulta tabla `orders` de Supabase filtrado por `user_id`, ordenado por fecha descendente
   - **Estado**: ✅ Implementado con Supabase

5. **`getAllOrders()`**
   - **Retorna**: `Promise<Order[]>` - Todos los pedidos del sistema
   - **Uso**: Admin (`app/admin/pedidos/page.tsx`) para listar todos los pedidos
   - **Implementación**: Consulta tabla `orders` de Supabase, ordenado por fecha descendente
   - **Estado**: ✅ Implementado con Supabase

6. **`updateOrderStatus(id: string, status: string)`**
   - **Retorna**: `Promise<Order | null>` - Pedido actualizado
   - **Uso**: Admin para cambiar estado (pending → processing → shipped → delivered)
   - **Estados esperados**: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
   - **Implementación**: Actualiza `status` y `updated_at` en tabla `orders` de Supabase
   - **Estado**: ✅ Implementado con Supabase

7. **`getOrderItems(orderId: string)`**
   - **Retorna**: `Promise<OrderItem[]>` - Items de un pedido
   - **Uso**: Mostrar detalles de un pedido (Admin y usuario)
   - **Implementación**: Consulta tabla `order_items` de Supabase filtrado por `order_id`
   - **Estado**: ✅ Implementado con Supabase

8. **`updateProductStock(productId: string, newStock: number)`**
   - **Retorna**: `Promise<{ stock_quantity: number; in_stock: boolean }>` - Stock actualizado
   - **Uso**: Al procesar un pedido, para actualizar stock del producto base
   - **Implementación**: Wrapper de `productsService.updateProduct()` que solo modifica stock
   - **Nota**: Los productos base no tienen stock, solo las variaciones
   - **Estado**: ✅ Implementado

9. **`updateVariationStock(variationId: string, newStock: number)`**
   - **Retorna**: `Promise<void>`
   - **Uso**: Al procesar un pedido, para actualizar stock de una variación específica
   - **Implementación**: Wrapper de `variationsService.updateVariation()` que solo modifica stock
   - **Estado**: ✅ Implementado

**Estructura de datos** (`DatabaseOrder`):
- Identificación: `id`, `order_number` (único, legible)
- Usuario: `user_id` (FK)
- Estado: `status` (string)
- Montos: `total_amount`, `shipping_cost`
- Envío: `shipping_type`, `shipping_country`, `shipping_speed`, `shipping_info`
- Pago: `payment_method`
- Notas: `notes`
- Metadatos: `created_at`, `updated_at`

**Flujo implementado**:
1. Usuario completa checkout → `checkoutService.processCheckout()`
2. Se valida stock y datos → `createOrder()` + `createOrderItem()` para cada item (persistido en Supabase)
3. Se actualiza stock de variaciones → `variationsService.updateVariation()` (reduce stock)
4. Usuario ve confirmación → `getOrderById()` (retorna el pedido creado desde Supabase)
5. Admin gestiona pedidos (`app/admin/pedidos/page.tsx`) → `getAllOrders()` lista todos los pedidos, `updateOrderStatus()` cambia estado (pending → processing → shipped → delivered)

---

### checkoutService

**Propósito**: Procesar el checkout completo (validación, creación de pedido, actualización de stock)

**Función principal**:

1. **`processCheckout(checkoutData: CheckoutData)`**
   - **Retorna**: `Promise<{ orderId: string; orderNumber: string }>`
   - **Uso**: Página de checkout (`app/checkout/page.tsx`) cuando usuario confirma compra
   - **Implementación** (flujo completo):
     1. **Validar stock**: Lee productos de Supabase usando `productsService.getProduct()` y variaciones usando `variationsService.getVariationById()`
     2. **Calcular totales**: Subtotal + costo de envío (según país y velocidad)
     3. **Crear pedido**: Usa `ordersService.createOrder()` (persiste en Supabase)
     4. **Crear items**: Usa `ordersService.createOrderItem()` para cada item (persiste en Supabase)
     5. **Actualizar stock**: Usa `variationsService.updateVariation()` para reducir stock en Supabase
   - **Estado**: ✅ Implementado con Supabase

**Estructura de datos** (`CheckoutData`):
- Usuario: `user_id`
- Items: `items[]` con `product_id`, `variation_id?`, `quantity`, `price`
- Dirección: `shipping_address` (address, city, postal_code, country, phone)
- Envío: `shipping_type` ('business' | 'customer'), `shipping_speed` ('standard' | 'express')
- Pago: `payment_method` (string)
- Notas: `notes?` (opcional)

**Dependencias**:
- `ordersService.createOrder()` ✅ Implementado con Supabase
- `ordersService.createOrderItem()` ✅ Implementado con Supabase
- `productsService.getProduct()` ✅ Usado para validar stock (lee de Supabase)
- `variationsService.getVariationById()` ✅ Implementado con Supabase
- `variationsService.updateVariation()` ✅ Implementado con Supabase

## 💡 Simplificaciones Aplicadas (Ver REFACTOR_PLAN.md)

### Componentes de Tienda (Frontend)
- **ProductFilters**: Filtrado completamente en el frontend usando `useMemo`, extrae opciones de `product.variations[]`
- **ProductCard**: Usa directamente `product.variations[]`, selecciona una variación y muestra su precio/stock específico
- **ProductConfigurator**: Usa directamente `product.variations[]`, permite seleccionar variación y muestra precio/stock
- **Página de producto**: Busca directamente en array `products` de `data.ts`, usa variaciones del producto seleccionado

### Servicios
- **productsService**: 
  - **Lectura**: `getProducts()` y `getProduct()` leen de Supabase (usados por `checkoutService` para validar stock)
  - **Modificación**: `createProduct()`, `updateProduct()`, `deleteProduct()` escriben en Supabase
  - **Nota**: La tienda y el admin aún leen directamente de `config/data.ts` (datos estáticos), pero los productos creados se guardan en Supabase
- **usersService**: Mantenidos wrappers de conveniencia (`approveUser`, `rejectUser`, etc.) porque mejoran legibilidad
- **variationsService**: CRUD básico para Admin y validación de stock en checkout. Lee/escribe de Supabase. Los componentes de tienda usan directamente `product.variations[]` de `config/data.ts` (datos estáticos)
- **ordersService**: Usa Supabase para persistencia completa de pedidos
- **checkoutService**: Usa `productsService.getProduct()` (Supabase) para validar stock
- **Principio**: CRUD básico, filtros en frontend cuando es posible, wrappers solo si mejoran claridad

### Migración Futura a Base de Datos
Cuando se migre a base de datos (Supabase/Firebase), se puede:
1. Cambiar `config/data.ts` para que lea de la base de datos en lugar de datos estáticos
2. Mantener la misma interfaz `Product` para que los componentes sigan funcionando sin cambios
3. Los servicios seguirán siendo útiles para Admin, pero la tienda puede seguir leyendo directamente

## ⚠️ Limitaciones Actuales

### Almacenamiento
- **✅ Supabase completamente implementado**: 
  - ✅ `ordersService` - Migrado a Supabase (pedidos persisten)
  - ✅ `checkoutService` - Migrado a Supabase (procesa y persiste pedidos)
  - ✅ `productsService` - Migrado a Supabase (productos persisten)
  - ✅ `usersService` - Migrado a Supabase (usuarios persisten)
  - ✅ `variationsService` - Migrado a Supabase (variaciones persisten)
- **Persistencia completa**: 
  - ✅ Pedidos persisten en Supabase
  - ✅ Productos creados persisten en Supabase
  - ✅ Usuarios aprobados persisten en Supabase
  - ✅ Variaciones persisten en Supabase
- **Nota sobre lectura de productos**: Aunque `productsService` lee de Supabase, la tienda y el admin aún leen directamente de `config/data.ts` (datos estáticos) por compatibilidad. El objetivo es migrar también la lectura a Supabase en el futuro.

### Servicios Pendientes
- ✅ **ordersService**: ✅ **IMPLEMENTADO** - Todas las funciones funcionan con Supabase
- ✅ **checkoutService**: ✅ **IMPLEMENTADO** - Procesa checkout completo con validación de stock y actualización, persiste en Supabase

### Funcionalidades Implementadas
- ✅ **Historial de pedidos**: Funciona y persiste en Supabase
- ✅ **Confirmación de pedido**: Integrado con `checkoutService.processCheckout()`
- ✅ **Gestión de pedidos en admin**: Página completa en `app/admin/pedidos/page.tsx` con filtros por estado
- ✅ **Actualización de stock**: Se ejecuta en `processCheckout()`
- ✅ **Validación de stock**: Valida stock antes de crear el pedido
- ✅ **Persistencia de pedidos**: Los pedidos se guardan en Supabase y persisten entre sesiones

### Flujo Actual del Checkout
El checkout actual funciona de la siguiente manera:
1. Usuario agrega productos al carrito (usando `CartContext`)
2. Usuario completa formulario de checkout (`app/checkout/page.tsx`)
3. ✅ **Usa `checkoutService.processCheckout()`** - Procesa el pedido completo
4. ✅ **Valida stock** - Verifica disponibilidad antes de crear el pedido
5. ✅ **Crea pedido en Supabase** - Persiste usando `ordersService.createOrder()`
6. ✅ **Crea items del pedido** - Persiste usando `ordersService.createOrderItem()`
7. ✅ **Actualiza stock** - Reduce stock de variaciones usando `variationsService.updateVariation()`
8. ✅ **Muestra confirmación** - Con número de pedido generado por el servicio

### Próximos Pasos Recomendados
1. ✅ Migrar `productsService` a Supabase (✅ Completado)
2. ✅ Migrar `usersService` a Supabase (✅ Completado)
3. ✅ Migrar `variationsService` a Supabase (✅ Completado)
4. Agregar validaciones de negocio (stock mínimo, precios, etc.)
5. Migrar lectura de productos en la tienda: cambiar `config/data.ts` para que lea de Supabase en lugar de datos estáticos
6. Sincronizar datos iniciales: crear script de migración para poblar Supabase con productos de `config/data.ts`

### Arquitectura de Datos

**Fuente de datos actual**:
- **Tienda (Frontend)**: Lee directamente de `config/data.ts` → array `products` (tipo `Product[]`) - datos estáticos
- **Admin (Lectura)**: Lee directamente de `config/data.ts` → array `products` (igual que la tienda) - datos estáticos
- **Admin (Modificación)**: Usa `productsService` que escribe en Supabase (tabla `products`)
- **Admin (Variaciones)**: Usa `variationsService` que lee/escribe en Supabase (tabla `product_variations`)
- **Checkout**: Usa `productsService.getProduct()` y `variationsService.getVariationById()` que leen de Supabase
- **Pedidos**: Todo se gestiona en Supabase (tablas `orders` y `order_items`)
- **Usuarios**: Todo se gestiona en Supabase (tabla `users`)

**Ventajas de la arquitectura actual**:
- ✅ Componentes de tienda simples y rápidos (sin transformaciones)
- ✅ Filtrado instantáneo en el frontend
- ✅ Fácil migración futura: solo cambiar `data.ts` para leer de BD
- ✅ Separación clara: Admin usa servicios, Tienda usa datos directos

**Migración futura**:
```typescript
// Actual (estático)
export const products: Product[] = [ /* ... */ ];

// Futuro (base de datos)
export async function getProducts(): Promise<Product[]> {
  // Leer de Supabase/Firebase
  // Mantener misma interfaz Product
}
```
Los componentes seguirán funcionando sin cambios porque usan la misma interfaz `Product`.
