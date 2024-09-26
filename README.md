### `동시성 제어란`

동시성 제어는 컴퓨터 프로그래밍에서 여러 프로세스나 스레드가 동시에 데이터에 접근하거나 변경할 때 발생할 수 있는 문제를 방지하는 기술입니다. 이 기술은 데이터의 일관성과 무결성을 유지하기 위해 사용되며, 여러 동시 작업이 공유 자원을 안전하게 사용할 수 있도록 돕습니다.

#### `동시성 제어의 필요성`

-   데이터 경합(Race Condition) 방지: 둘 이상의 연산이 동시에 같은 데이터를 수정하려고 할 때, 최종 결과가 연산의 순서에 따라 달라질 수 있습니다. 동시성 제어를 통해 이러한 상황을 관리할 수 있습니다.
-   데드락(Deadlock) 방지: 여러 프로세스가 서로 다른 자원을 보유하고 있으면서 상대방의 자원을 기다리는 상황에서, 서로가 무한히 대기하는 현상을 막을 수 있습니다.

#### `TypeScript에서의 동시성 제어 방법 - Mutex와 Semaphore 비교`

1. Mutex (뮤텍스)
   Mutex는 Mutual Exclusion(상호 배제)의 약자로, 한 번에 하나의 스레드만이 특정 자원 또는 코드 섹션에 접근을 허용하는 동기화 메커니즘입니다. TypeScript에서 Mutex는 주로 비동기 함수나 블록 내에서 공유 자원의 접근을 제어하는 데 사용됩니다.

2. Semaphore (세마포어)
   Semaphore는 일정 수량의 자원에 대한 접근을 제한하는 방법으로, 복수의 스레드가 동시에 자원에 접근할 수 있도록 허용합니다. 이는 리소스의 효율적 사용을 가능하게 하며, 대기 큐를 사용하여 자원을 요청하는 순서를 관리합니다.

어떤 글에 두 방법에 대해 이해를 돕고자 재밌게 풀이한 내용이 이해가 쉬웠다.

-   Mutex: 화장실이 하나뿐인 식당에서 카운터에 키가없으면 화장실은 이용중이고 카운터에 줄을서다가 키를 받아야만 화장실을 이용 할 수 있다.

    -   즉, key에 해당하는 어떤 오브젝트가 있고 소유한 Queue만이 Resource에 접근 가능하다.

-   Semaphore: 화장실이 여러개인 식당에서 빈칸을 보여주는 전광판에 숫자가 빈칸이 없을 경우 0, 빈칸이 생길때마다 +1이 된다. 화장실에 들어갈땐 -1이 된다.
    -   화장실은 공유자원이고 사람들이 쓰레드이다. 빈칸의 갯수는 현재 공유자원에 접근 할 수 있는 스레드 프로세스 개수이다.

#### `Mutex 선택`

#### 선택이유

-   단순성과 명확성: 뮤텍스는 관리가 간단하며, 코드에서 명확하게 어떤 부분이 동시성 제어를 받고 있는지를 알 수 있습니다.

#### 사용방법

-   뮤텍스 생성: 각 사용자 ID에 대해 Mutex 인스턴스를 생성하고, 이를 lockTable 레코드에 저장합니다. 사용자 ID가 키가 되며, 이렇게 하여 각 사용자마다 별도의 락을 관리할 수 있습니다.
-   락 획득 및 해제: 사용자 포인트를 업데이트하는 함수에서는 해당 사용자의 뮤텍스를 획득한 후 작업을 진행하고, 작업 완료 후에는 뮤텍스를 해제합니다. 이 과정은 mutex() 함수를 호출하여 뮤텍스를 가져오고, acquire() 메서드로 락을 획득한 후, 작업 완료시 release() 메서드를 호출하여 락을 해제하는 것을 포함합니다.

```typescript
const mutex = await this.mutex(userId);
const release = await mutex.acquire();
```

-   함수 호출: 메서드는 userId를 인자로 mutex 함수를 호출합니다. 이 함수는 lockTable에서 주어진 userId에 대한 뮤텍스가 존재하는지 확인합니다. 없다면 새로운 Mutex를 생성하고 lockTable에 저장합니다.
-   락 획득: Mutex 클래스의 acquire 메서드를 호출하여 뮤텍스를 잠급니다. 이는 다른 연산들이 동시에 같은 사용자의 데이터를 수정하는 것을 방지하여, 이후에 진행될 사용자 포인트 작업을 스레드-세이프(thread-safe)하게 만듭니다.

```typescript
const exUser = await this.findOne(userId);
const calcPoint = type === TransactionType.CHARGE ? amount : -amount;
updatedUserPoint = await this.userPpointRepo.insertOrUpdate(
    userId,
    exUser.point + calcPoint,
);
```

-   포인트 계산: 락을 획득한 후, 메서드는 사용자의 현재 포인트를 검색하고, 작업 유형이 충전인지 사용인지에 따라 새로운 포인트 총액을 계산합니다.
-   데이터베이스 업데이트: 새 포인트 총액은 데이터베이스에 기록됩니다. 이 작업은 뮤텍스에 의해 보호받아, 업데이트가 처리되는 동안 다른 프로세스가 사용자 포인트를 변경할 수 없습니다.

```typescript
release();
```

-   포인트 업데이트 및 트랜잭션 로깅(해당되는 경우) 후, release 메서드를 호출하여 뮤텍스 락을 해제합니다.

### `회고`

막막했던 1주차 과제가 팀원들과의 소통과 정보 공유로 조금씩 수정, 보완해 나갔습니다.
첫 TDD 경험이었고 발제를 받은 첫날 막막했고 일단 익숙한 서비스 로직 부터 작업했습니다.
팀원들과의 회의, 코치님들의 멘토링 시간들에서 힌트를 얻어가며 1주차 과제를 작업했고 그중 동시성제어, TDD에 관해서 많이 검색해봤습니다.

동시성제어를 작업하면서 JavaScript의 비동기 특성과 싱글 스레드 모델 때문에 전통적인 멀티스레딩 방식의 동시성 제어 기법을 직접 적용하는 것은 불가능했습니다.
이를 해결하기 위해 async-mutex 라이브러리를 사용하여 뮤텍스를 구현했고 데이터베이스 작업을 순차적으로 처리할 수 있었습니다.
또 TDD 작업시엔 머릿속의 단위테스트, 통합테스트를 구분하여 작성했지만 팀원들과 소통때마다 수정을 반복했습니다.
아직도 어떤방법이 맞는지는 확실히는 모르지만 테스트코드 작성이유와 장점에 대해서는 느끼는 계기가 되었습니다.

과거 일하면서 동시성 제어와 테스트코드에 대해 관심이 있었으면 어땠을까라는 아쉬움이 계속 들었습니다.
앞으로의 배움이 기대가 커진 1주차였습니다.
