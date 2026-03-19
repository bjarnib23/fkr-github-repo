<?php

namespace Drupal\fkr_booking\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Link;
use Drupal\Core\Site\Settings;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class BookingController extends ControllerBase {

  public function adminList(): array {
    $rows = \Drupal::database()->select('fkr_bookings', 'b')
      ->fields('b')
      ->orderBy('created', 'DESC')
      ->execute()
      ->fetchAll();

    $header = ['#', 'Nafn', 'Tölvupóstur', 'Sími', 'Panta', 'Dagsetning', 'Athugasemd', 'Móttekið', ''];

    $data = [];
    foreach ($rows as $row) {
      $deleteLink = Link::fromTextAndUrl('Eyða', Url::fromRoute('fkr_booking.delete_booking', ['id' => $row->id]))->toString();
      $data[] = [
        $row->id,
        $row->nafn,
        $row->tolvupostur,
        $row->simi,
        $row->panta,
        $row->dagsetning,
        $row->athugasemd,
        date('d.m.Y H:i', $row->created),
        ['data' => ['#markup' => $deleteLink]],
      ];
    }

    return [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $data,
      '#empty' => 'Engar bókanir hafa borist.',
    ];
  }

  public function stripeCheckout(Request $request): JsonResponse {
    if ($request->getMethod() === 'OPTIONS') {
      return new JsonResponse(NULL, 204, [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'POST, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type',
      ]);
    }

    $data = json_decode($request->getContent(), TRUE);

    // Save pending order first
    $id = \Drupal::database()->insert('fkr_gjafabref')
      ->fields([
        'upphaed'         => $data['upphaed'] ?? '',
        'nafn_kaupanda'   => $data['nafn_kaupanda'] ?? '',
        'nafn_vidtakanda' => $data['nafn_vidtakanda'] ?? '',
        'tolvupostur'     => $data['tolvupostur'] ?? '',
        'simi'            => $data['simi'] ?? '',
        'athugasemd'      => $data['athugasemd'] ?? '',
        'created'         => \Drupal::time()->getRequestTime(),
      ])
      ->execute();

    // Parse amount from title (e.g. "25.000 kr" → 25000)
    // Multiply by 100 because Stripe treats ISK as a 2-decimal currency
    $rawAmount = preg_replace('/[^\d]/', '', $data['upphaed'] ?? '0');
    $amountInt = (int) $rawAmount * 100;

    try {
      $secretKey  = Settings::get('stripe_secret_key');
      $reactBase  = Settings::get('react_base_url', 'http://localhost:5173');

      \Stripe\Stripe::setApiKey($secretKey);

      $session = \Stripe\Checkout\Session::create([
        'payment_method_types' => ['card'],
        'line_items' => [[
          'price_data' => [
            'currency' => 'isk',
            'unit_amount' => $amountInt,
            'product_data' => [
              'name' => 'Gjafabréf FKR Reykjavík - ' . ($data['upphaed'] ?? ''),
            ],
          ],
          'quantity' => 1,
        ]],
        'mode' => 'payment',
        'customer_email' => $data['tolvupostur'] ?? NULL,
        'success_url' => $reactBase . '/gjafabref?success=1&order=' . $id,
        'cancel_url'  => $reactBase . '/gjafabref?cancelled=1',
        'metadata' => ['order_id' => $id],
      ]);

      return new JsonResponse(['url' => $session->url]);
    }
    catch (\Exception $e) {
      return new JsonResponse(['error' => $e->getMessage()], 500);
    }
  }

  public function gjafabref(Request $request): JsonResponse {
    if ($request->getMethod() === 'OPTIONS') {
      return new JsonResponse(NULL, 204, [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'POST, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type',
      ]);
    }

    $data = json_decode($request->getContent(), TRUE);

    $required = ['upphaed', 'nafn_kaupanda', 'nafn_vidtakanda', 'tolvupostur', 'simi'];
    foreach ($required as $field) {
      if (empty($data[$field])) {
        return new JsonResponse(['error' => 'Vantar nauðsynlegar upplýsingar.'], 400);
      }
    }

    if (!filter_var($data['tolvupostur'], FILTER_VALIDATE_EMAIL)) {
      return new JsonResponse(['error' => 'Ógildur tölvupóstur.'], 400);
    }

    $id = \Drupal::database()->insert('fkr_gjafabref')
      ->fields([
        'upphaed'        => $data['upphaed'],
        'nafn_kaupanda'  => $data['nafn_kaupanda'],
        'nafn_vidtakanda'=> $data['nafn_vidtakanda'],
        'tolvupostur'    => $data['tolvupostur'],
        'simi'           => $data['simi'],
        'athugasemd'     => $data['athugasemd'] ?? '',
        'created'        => \Drupal::time()->getRequestTime(),
      ])
      ->execute();

    return new JsonResponse(['id' => $id, 'status' => 'confirmed'], 201);
  }

  public function gjafabrefAdmin(): array {
    $rows = \Drupal::database()->select('fkr_gjafabref', 'g')
      ->fields('g')
      ->orderBy('created', 'DESC')
      ->execute()
      ->fetchAll();

    $header = ['#', 'Upphæð', 'Kaupandi', 'Viðtakandi', 'Tölvupóstur', 'Sími', 'Athugasemd', 'Móttekið', ''];

    $data = [];
    foreach ($rows as $row) {
      $deleteLink = Link::fromTextAndUrl('Eyða', Url::fromRoute('fkr_booking.delete_gjafabref', ['id' => $row->id]))->toString();
      $data[] = [
        $row->id,
        $row->upphaed,
        $row->nafn_kaupanda,
        $row->nafn_vidtakanda,
        $row->tolvupostur,
        $row->simi,
        $row->athugasemd,
        date('d.m.Y H:i', $row->created),
        ['data' => ['#markup' => $deleteLink]],
      ];
    }

    return [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $data,
      '#empty' => 'Engar gjafabréfspantanir hafa borist.',
    ];
  }

  public function store(Request $request): JsonResponse {
    // Handle CORS preflight
    if ($request->getMethod() === 'OPTIONS') {
      return new JsonResponse(NULL, 204, [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'POST, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type',
      ]);
    }

    $data = json_decode($request->getContent(), TRUE);

    // Validate required fields
    $required = ['nafn', 'tolvupostur', 'simi'];
    foreach ($required as $field) {
      if (empty($data[$field])) {
        return new JsonResponse(['error' => 'Vantar nauðsynlegar upplýsingar.'], 400);
      }
    }

    // Validate email
    if (!filter_var($data['tolvupostur'], FILTER_VALIDATE_EMAIL)) {
      return new JsonResponse(['error' => 'Ógildur tölvupóstur.'], 400);
    }

    // Save to database
    $id = \Drupal::database()->insert('fkr_bookings')
      ->fields([
        'nafn'        => $data['nafn'],
        'tolvupostur' => $data['tolvupostur'],
        'simi'        => $data['simi'],
        'panta'       => $data['panta'] ?? '',
        'dagsetning'  => $data['dagsetning'] ?? '',
        'athugasemd'  => $data['athugasemd'] ?? '',
        'created'     => \Drupal::time()->getRequestTime(),
      ])
      ->execute();

    // Send confirmation email to client
    \Drupal::service('plugin.manager.mail')->mail(
      'fkr_booking',
      'booking_confirmation',
      $data['tolvupostur'],
      'is',
      [
        'nafn'        => $data['nafn'],
        'panta'       => $data['panta'] ?? '',
        'dagsetning'  => $data['dagsetning'] ?? '',
        'athugasemd'  => $data['athugasemd'] ?? '',
      ],
      NULL,
      TRUE
    );

    return new JsonResponse(['bookingId' => $id, 'status' => 'confirmed'], 201);
  }

  public function stripeWebhook(Request $request): JsonResponse {
    $webhookSecret = Settings::get('stripe_webhook_secret');
    $payload       = $request->getContent();
    $sigHeader     = $request->headers->get('Stripe-Signature');

    try {
      $secretKey = Settings::get('stripe_secret_key');
      \Stripe\Stripe::setApiKey($secretKey);
      $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
    }
    catch (\Exception $e) {
      return new JsonResponse(['error' => $e->getMessage()], 400);
    }

    if ($event->type === 'checkout.session.completed') {
      $session = $event->data->object;
      $orderId = $session->metadata->order_id ?? NULL;

      if ($orderId) {
        $row = \Drupal::database()->select('fkr_gjafabref', 'g')
          ->fields('g')
          ->condition('id', $orderId)
          ->execute()
          ->fetchObject();

        if ($row) {
          \Drupal::service('plugin.manager.mail')->mail(
            'fkr_booking',
            'gjafabref_confirmation',
            $row->tolvupostur,
            'is',
            [
              'upphaed'         => $row->upphaed,
              'nafn_kaupanda'   => $row->nafn_kaupanda,
              'nafn_vidtakanda' => $row->nafn_vidtakanda,
              'athugasemd'      => $row->athugasemd,
            ],
            NULL,
            TRUE
          );
        }
      }
    }

    return new JsonResponse(['status' => 'ok']);
  }

}
